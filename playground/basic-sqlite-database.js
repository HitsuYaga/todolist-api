var Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': 'basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
  'description': {
    type: Sequelize.STRING
  },
  'completed': {
    type: Sequelize.BOOLEAN
  }
})

sequelize.sync().then(() => {
  console.log('Everything is synced')
});
