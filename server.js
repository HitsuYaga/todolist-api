var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
app.use(bodyParser.json());

var todos = []
var todoNextId = 1;

app.get('/', (req, res) => {
  res.send('Todo List Api');
})

// Get All TodoList
app.get('/todos', (req, res) => {
  res.send(todos);
})

// Get TodoList by using id
app.get('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {'id': id});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(400).send();
  }
})

app.post('/todos', (req, res) => {
  body = _.pick(req.body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || (!_.isString(body.description)) || (body.description.trim().length === 0)) {
    return res.status(400).send();
  }

  body.id = todoNextId++;
  todos.push(body);

  res.json(body);
})

app.delete('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {'id': id});

  if (!matchedTodo) {
    res.status(400).json({'error': 'Can not found todo with id'});
  } else {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  }
})

app.put('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  body = _.pick(req.body, 'description', 'completed');
  var matchedTodo = _.findWhere(todos, {'id': id});
  validAttributes = {};

  if (!matchedTodo) {
    res.status(400).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if {
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && (body.description.trim().length === 0)) {
    validAttributes.description = body.description;
  } else if {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);

})

app.listen(3000, () => {
  console.log('Your server is starting in port 3000!');
})
