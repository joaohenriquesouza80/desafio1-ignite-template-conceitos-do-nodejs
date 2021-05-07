const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username,
  } = request.body;

  const findUser = users.find(user => user.username === username);
  if (findUser) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const {
    title,
    deadline,
  } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const {
    title,
    deadline,
  } = request.body;

  const todoIndex = user.todos.findIndex((todo => todo.id === id));

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found for this user' })
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  response.status(201).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo => todo.id === id));

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found for this user' })
  }

  user.todos[todoIndex].done = true;

  response.status(201).send(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo => todo.id === id));

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found for this user' })
  }

  user.todos.splice(todoIndex, 1);

  response.status(204).json();
});

module.exports = app;