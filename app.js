const chalk = require('chalk');
const $q = require('q');

function Board() {
  this.reset();
}

Board.prototype.reset = function() {
  this.cache = {
    values: [],
    board: ''
  };
  this.library = [];
}

Board.prototype.test = function() {
  // const tiles = [
  //   [1,2,3,4],
  //   [2,9,8,3],
  //   [3,8,9,7],
  //   [9,8,3,2],
  //   [9,8,6,5]
  // ]

  const tiles = [
    [1,1,3,2],
    [4,4,1,1],
    [1,6,6,3],
    [5,1,2,7],
    [4,6,6,2],
    [7,3,8,5]
  ]
  

  this.add(tiles).then(() => {
    console.log(this.render());
  })  
}

Board.prototype.tileGen = function(inp) { return new Tile(inp, this.library.length) }

Board.prototype.add = function(input) {
  if (Array.isArray(input[0])) {
    let chain = $q.when();
    for (let i = 0; i < input.length; i++) {
      chain = chain.then(() => this.add(input[i]));      
    }
    return chain;
  }
  return new Promise((resolve, reject) => {  
    let loc = [0, 0];
    let tile = new Tile(input, this.library.length);

    if (!this.cache.values.length) {
      tile.place({x: 0, y: 0, rotation: 0});
      this.updateCache(tile);
      resolve(this);
      return;
    }

    this.tileScan(tile)
      .then((res) => {
        this.place(res, tile)
          .then(resolve)
          .catch(reject)
      }).catch(reject);
  });
}

Board.prototype.updateCache = function(tile) {  
  if (this.library.length !== tile.id) {
    let newcache = this.cache.board.replace(new RegExp('(' + tile.id + ')\\.\\d*\\--?\\d*\\,-?\\d*;'), tile.placeString());
    this.cache.board = this.cache.board.replace(new RegExp('(' + tile.id + ')\\.\\d*\\--?\\d*\\,-?\\d*;'), tile.placeString());
  } else {
    this.cache.values = this.cache.values.concat(tile.lib);
    this.cache.board += tile.placeString();
    this.library.push(tile);
  }
}

Board.prototype.place = function(scanResult, newTile) {
  return new Promise((resolve, reject) => {
    const matchTile = this.library[scanResult.matchTile.id];
    const matchSide = scanResult.matchTile.side;
    
    let placement = {};
    let availableSide = null;        

    if (matchTile.neighbors[matchSide] === null) {
      availableSide = matchSide;
    } else {      
      matchTile.neighbors.some((side, idx) => {
        if (side === null) {
          availableSide = idx;
          matchTile.rotation = this.util.rotationDelta(matchSide, availableSide);
          this.updateCache(matchTile);
          return true;
        }
        return false;
      })
    }

    if (availableSide === null) {
      reject({error: 1})
      return;
    }
    
    matchTile.addNeighbor(availableSide, newTile.id);
    newTile.addNeighbor(this.util.opposite(availableSide), matchTile.id);

    // opposite 
    switch(availableSide) {
      case 0:
        placement.x = matchTile.x;
        placement.y = matchTile.y - 1;        
        break;
      case 1:
        placement.x = matchTile.x + 1;
        placement.y = matchTile.y;
        break;
      case 2:
        placement.x = matchTile.x;
        placement.y = matchTile.y + 1;
        break;
      case 3:
        placement.x = matchTile.x - 1;
        placement.y = matchTile.y;
        break;
    }

    placement.rotation = this.util.matchRotation(scanResult.side, availableSide);

    newTile.place(placement);    
    this.updateCache(newTile);

    resolve(this);
  })
}


// Board.prototype.neighbor.

Board.prototype.placementAvailable = function(matchTile, matchSide) {
  let occupied = false;
  switch(matchSide) {
    case 0:
      occupied = !!this.search('coords', [matchTile.x, matchTile.y - 1]);
      break;
    case 1:
      occupied = !!this.search('coords', [matchTile.x + 1, matchTile.y]);
      break;
    case 2:
      occupied = !!this.search('coords', [matchTile.x, matchTile.y + 1]);
      break;            
    case 3:
      occupied = !!this.search('coords', [matchTile.x - 1, matchTile.y]);
      break;      
  }
    console.log('avail: ', {matchSide, occupied});
  return !occupied;
}

Board.prototype.search = function(param, value) {
  const query = new Query(param, value);
  const result = this.cache.board.match(query.regex);
  return result ? this.library[result[1]] : null;
}

function Query(param, value) {
  this.regex = this[param](value);
}
Query.prototype.coords = function(val) { return new RegExp('(\\d*)\\.\\d*\\--?' + val[0] + '\\,-?' + val[1]); }
Query.prototype.id = function(val) { return new RegExp('(' + val + ')\\.\\d*)\\--?\\d*\\,-?\\d*'); }

// input = []
Board.prototype.tileScan = function(tile) {
  return new Promise((resolve, reject) => {
    const foundMatch = tile.scan.some((sideValue, side) => {
      const match = this.cache.values.indexOf(sideValue);

      if (match !== -1) {
        resolve(        {
          matchTile: {
            id: Math.floor(match / 4),
            side: match % 4
          },
          side
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

Board.prototype.util = {
  opposite: (side) => {
    return (side + 2) % 4;
  },
  rotationDelta: (from, to) => {
    // Rotating side 'from' to be where 'to' is.
    // e.g., rotate(1,3) rotates side 1 to be where side 3 was,
    // which is a rotation of 2.  
    return ((to - from) + 4) % 4;    
  },
  matchRotation: (source, target) => {
    // Target needs to be opposite side of tile to source.
    // e.g. source of 1 matches target of 3, so rotation is 0.
    return ((target - source) + 6) % 4;
  }
}

Board.prototype.render = function() {
  let output = [];
  const bounds = {
    x: {},
    y: {}    
  };
  bounds.x.offset = Math.abs(Math.min(...this.library.map((tile) => tile.x)));
  bounds.x.max    = Math.max(...this.library.map((tile) => tile.x)) + bounds.x.offset;
  bounds.y.offset = Math.abs(Math.min(...this.library.map((tile) => tile.y)));
  bounds.y.max    = Math.max(...this.library.map((tile) => tile.y)) + bounds.y.offset

  for (let y = 0; y <= bounds.y.max; y++) {
    output = output.concat([[], []]);
    for (let x = 0; x <= bounds.x.max; x++) {
      let tile = this.search('coords', [x - bounds.x.offset, y - bounds.y.offset]);
      if (tile) {
        output[y*2] = output[y*2].concat([chalk.green(tile.getCurrentValue(0)), chalk.green(tile.getCurrentValue(1))]);
        output[y*2 + 1] = output[y*2 + 1].concat([chalk.green(tile.getCurrentValue(3)), chalk.green(tile.getCurrentValue(2))]);
      } else {
        output[y*2] = output[y*2].concat([' ', ' ']);
        output[y*2 + 1] = output[y*2 + 1].concat([' ', ' ']);
      }
    }
  }

  const hr = chalk.dim('-'.repeat((bounds.x.max + 1) * 8 - 2))  

  return output.map((row) => row.join(' ' + chalk.dim('|') + ' ')).join('\n' + hr + '\n');
}

function Tile(tile, index) {
  this.id = index;
  this.value = tile;
  this.lib = ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]];
  this.scan = ['' + tile[1] + tile[0], '' + tile[2] + tile[1], '' + tile[3] + tile[2], '' + tile[0] + tile[3]];
  this.neighbors = [null, null, null, null];
}

Tile.prototype.place = function(placeObj) {
  this.x = placeObj.x;
  this.y = placeObj.y;
  this.rotation = placeObj.rotation;

  return this;
}

Tile.prototype.rotate = function(rotation) {
  this.rotation = rotation;
}

Tile.prototype.addNeighbor = function(idx, tileId) {
  this.neighbors[idx] = tileId;
}

Tile.prototype.placeString = function() {
  return `${this.id}.${this.rotation}-${this.x},${this.y};`;
}

Tile.prototype.getCurrentValue = function(idx) {
  return this.value[((idx - this.rotation) + 4) % 4];
}

module.exports = new Board();