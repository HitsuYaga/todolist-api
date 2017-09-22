var Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/data/dev-todo-api.sqlite'
});

db = {}

db.todo = sequelize.import(__dirname + '/models/todo.js')
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;