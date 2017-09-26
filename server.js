var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
app.use(bodyParser.json());

var todos = []
var todoNextId = 1;

app.get('/', (req, res) => {
  res.send('Todo List Api');
})

// Get All TodoList
app.get('/todos', (req, res) => {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then((todos) => {
    res.json(todos);
  }, (e) => {
    res.status(500).send();
  })
})

// Get TodoList by using id
app.get('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  // var matchedTodo = _.findWhere(todos, {'id': id});
  var matchedTodo = db.todo.findById(id).then((todo) => {
    return res.json(todo.toJSON());
  }, (e) => {
    return res.status(404).json(e);
  });
})

app.post('/todos', (req, res) => {
  body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then((todo) => {
    return res.json(todo.toJSON());
  }, (e) => {
    return res.status(400).json(e);
  })
})

app.delete('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: id
    }
  }).then((rowsDelete) => {
    if (rowsDelete === 0) {
      res.status(404).json({
        error: 'No id found!'
      })
    } else {
      res.status(204).send();
    }
  }, (e) => {
    res.status(500).send();
  })
})

app.put('/todos/:id', (req, res) => {
  var id = parseInt(req.params.id, 10);
  body = _.pick(req.body, 'description', 'completed');
  attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(id).then((todo) => {
    if (todo) {
      todo.update(attributes).then((todo) => {
        res.json(todo.toJSON());
      }, (e) => {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, () => {
    res.status(500).send();
  });

});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then((user) => {
    res.json(user.toPublicJSON());
  }, (e) => {
    res.status(400).json(e);
  })
})

db.sequelize.sync({force: true}).then(() => {
  app.listen(3000, () => {
    console.log('Your server is starting in port 3000!');
  })
});
