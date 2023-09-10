// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let todosWindow;

function createWindow () {
  // Create the browser window.
  todosWindow = new BrowserWindow({
    minWidth: 350,    
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      // NodeIntegration: true (default is false) - access Node.js resources from within the renderer (frontend).
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // and load the index.html of the app.
  todosWindow.loadFile('renderer/todos.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  todosWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    todosWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (todosWindow === null) createWindow()
})

// SWP3: When the SheetWindow is done loading, set db variable to new sqlite3 database. Call openDB()
ipcMain.on('todosWindowLoaded', (event) => {
  // Set variable to the app's userData path.
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'sqlite.db');

  if (!fs.existsSync(dbPath)) {
    db = new Database(dbPath);
    const stmt = db.prepare('CREATE TABLE todos (id INTEGER PRIMARY KEY, task TEXT, details TEXT, done BOOLEAN)');
    stmt.run();
    const stmt2 = db.prepare('INSERT INTO todos(task, details, done) VALUES (?, ?, ?)');
    stmt2.run('Learn Electron', 'Lorem Ipsum', false);
  } else {
    db = new Database(dbPath);
    let todos;
    try {
      const queryTodos = db.prepare('SELECT id, task, details, done FROM todos ORDER BY done');
      todosArray = queryTodos.all();

      // Send the category list.
      todosWindow.webContents.send('todosArray', todosArray);

    } catch (err) {
      console.error(err);
    }
  }
});

// ------------- ADD TODO -------------
let addWindow;
// Catch new
ipcMain.on('addForm', (event) => {
  if (!addWindow) {
    addWindow = new BrowserWindow({
      minWidth: 350,    
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    addWindow.loadFile('renderer/add.html');

    // Handle garbage collection
    addWindow.on('close', () => { addWindow = null; });
  } else {
    dialog.showMessageBox({ type: 'warning', message: 'An Add New To Do form is already open.' });
  }
});

// Catch cat:create
ipcMain.on('add', (event, todo) => {
  try {
    const stmt = db.prepare('INSERT INTO todos(task, details, done) VALUES (?, ?, ?)');
    stmt.run(todo.task, todo.details, todo.done);
    todosWindow.reload();
  } catch (err) {
    console.error(err.message);
  }
  addWindow.close();
});

// ------------- EDIT TODO -------------
let editWindow;
// Catch new
ipcMain.on('editForm', (event, todoId) => {
  if (!editWindow) {
    editWindow = new BrowserWindow({
      minWidth: 350,    
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    editWindow.loadFile('renderer/edit.html', { query: { todoId } });

    // Handle garbage collection
    editWindow.on('close', () => { editWindow = null; });
  } else {
    dialog.showMessageBox({ type: 'warning', message: 'An Edit To Do form is already open.' });
  }
});

ipcMain.on('editWindowLoaded', (event, todoId) => {
  try {
    const query = db.prepare('SELECT task, details, done FROM todos WHERE id = (?)');
    const todo = query.get(todoId);
    editWindow.webContents.send('todo', todo);
  } catch (err) {
    console.error(err);
  }
});

// Catch edit
ipcMain.on('edit', (event, todo) => {
  try {
    const stmt = db.prepare('UPDATE todos SET task = ?, details = ?, done = ? WHERE id = ?');
    stmt.run(todo.task, todo.details, todo.done, todo.id);
    todosWindow.reload();
  } catch (err) {
    console.error(err.message);
  }
  editWindow.close();
});

ipcMain.on('delete', (event, todoId) => {
  try {
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    stmt.run(todoId);
    editWindow.close();
    todosWindow.reload();
  } catch (err) {
    console.error(err);
  }
});
