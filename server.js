var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

var app = express();
app.use(bodyParser.json());

var todos = []
var todoNextId = 1;

app.get('/', (req, res) => {
  res.send('Todo List Api');
})

// Get All TodoList
app.get('/todos', middleware.requireAuthentication, (req, res) => {
  var query = req.query;
  var where = {
    userId: req.user.get('id')
  };

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
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
  var id = parseInt(req.params.id, 10);
  // var matchedTodo = _.findWhere(todos, {'id': id});
  var matchedTodo = db.todo.findOne({
    where: {
      id: id,
      userId: req.user.get('id')
    }
  }).then((todo) => {
    return res.json(todo.toJSON());
  }, (e) => {
    return res.status(404).json(e);
  });
})

app.post('/todos', middleware.requireAuthentication, (req, res) => {
  body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then((todo) => {
    req.user.addTodo(todo).then(() => {
      return todo.reload();
    }).then((todo) => {
      res.json(todo.toJSON());
    })
  }, (e) => {
    return res.status(400).json(e);
  })
})

app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
  var id = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: id,
      userId: req.user.get('id')
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

app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
  var id = parseInt(req.params.id, 10);
  body = _.pick(req.body, 'description', 'completed');
  attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findOne({
    where: {
      id: id,
      userId: req.user.get('id')
    }
  }).then((todo) => {
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

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, 'email', 'password');
  var userInstance;

  db.user.authenticate(body).then((user) => {
    var token = user.generateToken('authentication');
    userInstance = user;
    return db.token.create({
			token: token
		});
  }).then((tokenInstance) => {
    res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
  }).catch(() => {
    res.status(401).send();
  });
})

app.delete('/users/login', middleware.requireAuthentication, (req, res) => {
  req.token.destroy().then(() => {
    res.status(204).send();
  }).catch(() => {
    res.status(500).send();
  })
});

db.sequelize.sync({force: true}).then(() => {
  app.listen(3000, () => {
    console.log('Your server is starting in port 3000!');
  })
});
