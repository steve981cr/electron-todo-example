const { ipcRenderer } = require('electron');
const querystring = require('querystring');

const form = document.getElementById('form');
const task = document.getElementById('task');
const details = document.getElementById('details');
const done = document.getElementById('done');
const deleteBtn = document.getElementById('delete-btn');

const query = querystring.parse(global.location.search);
const todoId = Number(query['?todoId']);

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('editWindowLoaded', todoId);
  ipcRenderer.on('todo', (event, todo) => {
    document.getElementById('task').value = todo.task;
    document.getElementById('details').value = todo.details;
    document.getElementById('done').checked = Boolean(todo.done);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const todo = {
    id: todoId,
    task: task.value,
    details: details.value,
    done: Number(done.checked),
  };
  ipcRenderer.send('edit', todo);
});

deleteBtn.addEventListener('click', (event) => {
  ipcRenderer.send('delete', todoId);
});