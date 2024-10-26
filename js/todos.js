// Document bindings
const todosElement = document.getElementById('todo-container');
const todoDescription = document.getElementById("todo-description");
const errorMessage = document.getElementById('error-message');
const todoAddButton = document.getElementById('todo-add');

// Initialize ID from localStorage
let ourId = localStorage.getItem("todoId") ?? null;


// Event listeners
todoAddButton.addEventListener('click', createTodo);
todosElement.addEventListener('click', handleTodoDelete);
todoDescription.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        createTodo();
    }
});


// Handles the deletion of list to-do items when the delete button is clicked.
function handleTodoDelete(e) {
    const todoItem = e.target.closest('.todo-item');
    if (todoItem && e.target.closest('.todo-delete')) {
        const tid = todoItem.getAttribute('data-tid');
        deleteTodo(tid);
    }
}

// Creates a new to-do item by sending a POST request to the API.
// Validates the input field and shows an error message if empty.
function createTodo() {
    const description = todoDescription.value.trim();
    if (!description) {
        showError('Please enter a description for the task');
        return;
    }

    hideError(); // Hide the error message if any
    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    })
        .then(res => res.json()) // Parse the response as JSON
        .then(addTodoItem)
        .finally(() => { todoDescription.value = ""; });
}

// Fetches existing todos from the API and displays them in the UI.
function fetchTodos() {
    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/`)
        .then(res => res.json())
        .then(res => res.forEach(addTodoItem));
}


// Deletes a to-do item by sending a DELETE request to the API.
function deleteTodo(tid) {
    fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}/todo/${tid}`, {
        method: 'DELETE'
    })
        .then(() => removeTodoItem(tid));
}


// Creates a new user by sending a POST request to the API and stores the user ID in localStorage.
// Fetches todos for the created user.
function createUser() {
    const userid = sessionStorage.getItem('peerId');
    fetch('https://671d0b6909103098807c0fdc.mockapi.io/user/', { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            ourId = res["id"];
            localStorage.setItem("todoId", ourId);
            return updateUser(userid);
        })
        .then(fetchTodos);
}

//Updates the user with the peerId by sending a PUT request to the API.
function updateUser(userid) {
    return fetch(`https://671d0b6909103098807c0fdc.mockapi.io/user/${ourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid })
    });
}

// Initializes the app by checking if the user ID exists in localStorage.
// If not, a new user is created. Otherwise, todos are fetched for the existing user.
function init() {
    if (ourId === null) {
        createUser();
    } else {
        fetchTodos();
    }
}

//Adds a to-do item to the UI.
function addTodoItem(item) {
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-item');
    todoItem.setAttribute('data-tid', item.id);

    todoItem.innerHTML = `
        <div class="todo-delete">
            <i class="fas fa-trash"></i>
        </div>
        <span class="todo-text">${item.description}</span>
    `;

    todosElement.appendChild(todoItem);
}

// Removes a to-do item from the UI.
function removeTodoItem(tid) {
    const todoElement = document.querySelector(`[data-tid="${tid}"]`);
    if (todoElement) {
        todoElement.remove();
    }
}

// Show the error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide the error message
function hideError() {
    errorMessage.style.display = 'none';
}

init();

