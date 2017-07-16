var inquirer = require('inquirer');

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
    answers.push(JSON.parse(res.tile));
    console.log(answers);
    ask();
  })
}

ask();