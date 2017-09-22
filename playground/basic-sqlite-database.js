var Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': 'basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
  'description': {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  'completed': {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

sequelize.sync({
  // force: true
}).then(() => {
  console.log('Everything is synced')
  Todo.findById(1).then((todo) => {
    if (todo) {
      console.log(todo.toJSON());
    } else {
      console.log('Can not found with this ID')
    }
  })

  //   description: 'Finish the final exam',
  //   completed: false
  // }).then((todo) => {
  //   return Todo.create({
  //     description: 'Walking with my dog'
  //   })
  // }).then(() => {
  //   // return Todo.findById(1)
  //   return Todo.findAll({
  //     where: {
  //       completed: false,
  //       description: {
  //         $like: '%final%'
  //       }
  //     }
  //   })
  // }).then((todos) => {
  //   if (todos) {
  //     todos.forEach((todo) => {
  //       console.log(todo.toJSON())
  //     })
  //   } else {
  //     console.log('Can not found!')
  //   }
  // }).catch((e) => {
  //   console.log(e);
  // })
});
