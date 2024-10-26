// Document bindings
const todosElement = document.getElementById('todo-container');
const todoDescription = document.getElementById("todo-description");
const errorMessage = document.getElementById('error-message');

document.getElementById('todo-add').addEventListener('click', createTodo);

let ourId = localStorage.getItem("todoId") ?? null;

todosElement.addEventListener('click', (e) => {
    if (e.target.closest('.todo-delete')) {
        const todoItem = e.target.closest('.todo-item');
        if (todoItem) {
            const tid = todoItem.getAttribute('data-tid');
            deleteTodo(tid);
        }
    }
});

function createTodo() {
    if (!todoDescription.value.trim()){
        errorMessage.textContent = 'Please enter a description for the task';
        errorMessage.style.display = 'block';
        return;
    } else {
        errorMessage.style.display = 'none';
    }

    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description: todoDescription.value,
        })
    })
        .then(res => res.json())
        .then(res => {
            const tid = res["id"];
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.setAttribute('data-tid', tid);

            todoItem.innerHTML = `
                <div class="todo-delete">
                    <i class="fas fa-trash"></i>
                </div>
                <span class="todo-text">${todoDescription.value.trim()}</span>
            `;

            todosElement.appendChild(todoItem);
            todoDescription.value = ""
        });
}


function fetchTodos() {
    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/`)
        .then(res => res.json())
        .then(res => {
            console.log(res);
            for (const item of res) {
                const tid = item["id"];
                const todoItem = document.createElement('div');
                todoItem.classList.add('todo-item');
                todoItem.setAttribute('data-tid', tid);

                todoItem.innerHTML = `
                    <div class="todo-delete">
                        <i class="fas fa-trash"></i>
                    </div>
                    <span class="todo-text">${item["description"]}</span>
                `;

                todosElement.appendChild(todoItem);
            }
        });
}

function deleteTodo(tid) {
    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/${tid}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(() => {
            const todoElement = document.querySelector(`[data-tid="${tid}"]`);
            if (todoElement) {
                todoElement.remove();
            }
        });
}

function createUser() {
    const userid = sessionStorage.getItem('peerId');
    fetch('https://671d0b6909103098807c0fdc.mockapi.io/user/', {
        method: "POST",
    })
        .then(res => res.json())
        .then((res) => {
            ourId = res["id"];
            localStorage.setItem("todoId", ourId)
            fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid })
            })
                .then(fetchTodos)
        })

}

function init() {
    if (ourId === null) {
        createUser()
    } else {
        fetchTodos()
    }
}

init();
