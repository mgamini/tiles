// import program from 'commander';
// import { version } from './package.json';

// program
// 	.version(version);

const fs = require('fs');

let cmds = {};

function Board() {
  this.reset();
}

Board.prototype.reset = function() {
  this.x = {
    max: 0,
    min: 0
  };
  this.y = {
    max: 0,
    min: 0
  };
  // v2 // this.rowCache = {};
  this.cache = [];
  this.library = [];
}

Board.prototype.test = function() {
  this.add([1,2,3,4]);
  t1 = new Tile([2,9,8,3]);

  return this.scan(t1.scan).then((res) => console.log(res)).catch((err) => console.log(err))
}


Board.prototype.add = function(input) {
  return new Promise((resolve, reject) => {  
    let loc = [0, 0];
    let tile = new Tile(input);

    if (!this.library.length) {
      // v2 // this.rows[0] = '0.0-0,0';      
      this.cache = [tile.place(0, 0, 0)];
      this.library = tile.lib;
      return;
    }

    this.scan(tile.scan)
      .then(this.place)
      .catch(reject);
    // this.library = this.library.concat(input);
  });
}

Board.prototype.place = function(tile, scanResult) {
  const matchTile = Math.floor(scanResult.match / 4);
  const matchSide = scanResult.match % 4;


}

// input = []
Board.prototype.scan = function(input) {
  return new Promise((resolve, reject) => {
    const foundMatch = input.some((sideValue, side) => {
      const match = this.library.indexOf(sideValue);

      if (match !== -1) {
        resolve({
          side,
          match
        });
        return true;
      }
      

      return false;
    })

    if (!foundMatch) {
      reject({
        error: 'Match not found!'
      });
    }
  });
}

function Tile(tile) {
  this.value = tile;
  this.lib = ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]];
  this.scan = ['' + tile[1] + tile[0], '' + tile[2] + tile[1], '' + tile[3] + tile[2], '' + tile[0] + tile[3]];
}

Tile.prototype.place = function(x, y, rotation) {
  this.x = x;
  this.y = y;
  this.rotation = rotation;
  
  return this;
}
// [1,2,3,4,5].some((a, i) => {
// 	console.log(a, i)
// 	return a === 3
// })



cmds.load = function() {
  return JSON.parse(fs.readFileSync('./test/input.json'));
}

cmds.fire = function() {
  const input = JSON.parse(fs.readFileSync('./test/input.json'));

  const output = input.map((tile) => {
    return ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]];
  })

  return output;
}


cmds.clear = function() {
  board = new BOARD();
}

module.exports = new Board();
// export default cmds;