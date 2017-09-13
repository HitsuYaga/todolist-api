var express = require('express');

var app = express();

var todos = [
  {
    'id': 1,
    'description': 'Do task 1',
    'complete': false
  },
  {
    'id': 2,
    'description': 'Do task 2',
    'complete': false
  },
  {
    'id': 3,
    'description': 'Do task 3',
    'complete': false
  }
]

app.get('/', (req, res) => {
  res.send('Todo List Api');
})

app.get('/todos', (req, res) => {
  res.send(todos);
})

app.get('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  var matchTodo;

  todos.forEach((todo) => {
    if (id === todo.id) {
      matchTodo = todo;
    }
  });
  if (matchTodo) {
    res.json(matchTodo);
  } else {
    res.status(400).send();
  }
})

app.listen(3000, () => {
  console.log('Your server is starting in port 3000!');
})
