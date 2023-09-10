const { ipcRenderer } = require('electron');

const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('todosWindowLoaded');
  ipcRenderer.on('todosArray', (event, todosArray) => {
    let todoListItems = '';
    if (todosArray.length > 0) {
      todosArray.forEach((todo) => {
        todoListItems += `<li id="${todo.id}" class="py-1 list-group-item${todo.done ? ' text-decoration-line-through' : ''}">${ todo.task }<button class="btn btn-outline-secondary btn-sm py-0 float-end">Details</button></li>`;
      });
    }
    todoList.innerHTML = todoListItems;
  });
});

// ------------- ADD TODO -------------
addBtn.addEventListener('click', () => {
  console.log('add');
  ipcRenderer.send('addForm');
});

// ------------- EDIT TODO -------------
todoList.addEventListener('click', function(event) {
  if (event.target.classList.contains('btn')) {
    todoId = event.target.parentElement.id;
    ipcRenderer.send('editForm', todoId);
  }
});
