var inquirer = require('inquirer');
var app = require('./app');
var chalk = require('chalk')

let answers = [];

function ask() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'tile',
      message: 'Enter a tile (e.g. \'1,2,3,4\'):',
      validate: (res) => {
        const match = res.match(/\d/gi);
        if (match && match.length === 4) {
          return true
        } else {
          return 'Please enter a valid tile.';
        }
      },
      filter: (res) => {
        if (!res.startsWith('[')) {
          res = '[' + res + ']';
        }
        return res;
      }
    }
  ]).then((res) => {    
    app.add(JSON.parse(res.tile)).then(() => {
      console.log('\n\n==================================\n\n')
      console.log(app.render());
      console.log('\n\n==================================')
      console.log(chalk.dim(app.cache.board))
      console.log('==================================\n\n')
      ask();      
    }).catch((err) => {
      chalk.red(err);
    });
  })
}

ask();