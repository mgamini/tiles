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
  this.cache = {
    values: [],
    board: ''
  };
  this.library = [];
}

Board.prototype.test = function() {
  this.add([1,2,3,4]);
  t1 = new Tile([2,9,8,3]);

  return this.tileScan(t1).then((res) => console.log(res)).catch((err) => console.log(err))
}


Board.prototype.add = function(input) {
  return new Promise((resolve, reject) => {  
    let loc = [0, 0];
    let tile = new Tile(input, this.library.length);

    if (!this.cache.values.length) {
      // v2 // this.rows[0] = '0.0-0,0';      
      this.library = [tile.place(0, 0, 0)];
      this.updateCache(tile);      
      return;
    }

    this.tileScan(tile)
      .then(this.place)
      .catch(reject);
    // this.cache = this.cache.concat(input);
  });
}

Board.prototype.updateCache = function(tile) {
  this.cache.values.concat(tile.lib);
  this.cache.board += tile.placeString;
}

Board.prototype.place = function(tile, scanResult) {
  const matchTile = this.library[Math.floor(scanResult.match / 4)];
  const matchSide = scanResult.match % 4;


}

Board.prototype.search = {  
  x: (val) => {
    return this.library[this.cache.board.match(new Regexp('/(\d*)\.(\d*)\-(' + val + ')\,(\d*)/'))[1]];
  },
  y: (val) => {
    return this.library[this.cache.board.match(new Regexp('/(\d*)\.(\d*)\-(\d*)\,(' + val + ')/'))[1]];
  },
  id: (val) => {
    return this.library[this.cache.board.match(new Regexp('/(' + val + ')\.(\d*)\-(\d*)\,(\d*)/'))[1]];
  }
}


// input = []
Board.prototype.tileScan = function(tile) {
  return new Promise((resolve, reject) => {
    const foundMatch = tile.scan.some((sideValue, side) => {
      const match = this.cache.values.indexOf(sideValue);

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

function Tile(tile, index) {
  this.index = index;
  this.value = tile;
  this.lib = ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]];
  this.scan = ['' + tile[1] + tile[0], '' + tile[2] + tile[1], '' + tile[3] + tile[2], '' + tile[0] + tile[3]];
}

Tile.prototype.place = function(x, y, rotation) {
  this.x = x;
  this.y = y;
  this.rotation = rotation;
  this.placeString = this.generatePlaceString();

  return this;
}

Tile.prototype.generatePlaceString = function() {
  return `${this.index}.${this.rotation}-${this.x},${this.y}`;
}

module.exports = new Board();