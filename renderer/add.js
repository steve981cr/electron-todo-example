const { ipcRenderer } = require('electron');

const form = document.getElementById('form');
const task = document.getElementById('task');
const details = document.getElementById('details');
const done = document.getElementById('done');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const todo = {
    task: task.value,
    details: details.value,
    done: Number(done.checked),
  };
  ipcRenderer.send('add', todo);
});

