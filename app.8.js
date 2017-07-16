// import program from 'commander';
// import { version } from './package.json';

// program
// 	.version(version);

const fs = require('fs');

let cmds = {};

const ERRORS = [
  'Match not found',
  'Cannot place tile'
]

function Board() {
  this.reset();
}

Board.prototype.reset = function() {
  // this.x = {
  //   max: 0,
  //   min: 0
  // };
  // this.y = {
  //   max: 0,
  //   min: 0
  // };
  // v2 // this.rowCache = {};
  this.cache = {
    values: [],
    board: ''
  };
  this.library = [];

  this.tiles = [
    [1,2,3,4],
    [2,9,8,3],
    [3,8,9,7],
    [9,8,3,2],
    [9,8,6,5]
  ]
}

Board.prototype.test = function() {
  // this.add([1,2,3,4]);
  // t1 = new Tile([2,9,8,3]);

  // return this.tileScan(t1).then((res) => console.log(res)).catch((err) => console.log(err))
  const tiles = [
    [1,2,3,4],
    [2,9,8,3],
    [3,8,9,7],
    [9,8,3,2]
  ]
  

  a.add(a.tiles[0]); a.add(a.tiles[0]); a.add(a.tiles[0]); a.add(a.tiles[0]);
}

Board.prototype.tileGen = function(inp) { return new Tile(inp) }

Board.prototype.add = function(input) {
  return new Promise((resolve, reject) => {  
    let loc = [0, 0];
    let tile = new Tile(input, this.library.length);

    if (!this.cache.values.length) {
      // v2 // this.rows[0] = '0.0-0,0';      
      tile.place({x: 0, y: 0, rotation: 0});
      this.updateCache(tile);      
      return;
    }

    this.tileScan(tile)
      .then((res) => {
        console.log('scan complete', res);
        this.place(res, tile).then((res) => {
          // console.log('place complete', res)

        }).catch((reject) => console.log(reject))
      })
      .catch((reject) => {
        console.log('error', reject)
      });
    // this.cache = this.cache.concat(input);
  });
}

Board.prototype.updateCache = function(tile) {
  this.cache.values = this.cache.values.concat(tile.lib);
  this.cache.board += tile.placeString;
  this.library.push(tile);
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
          matchTile.rotate(this.util.rotationDelta(matchSide, availableSide));          

          return true;
        }
        return false;
      })
    }

    if (availableSide === null) {
      reject({error: 1})
      return;
    }
    
    matchTile.addNeighbor(availableSide, newTile.index);
    newTile.addNeighbor(this.util.opposite(availableSide), matchTile.index);

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
    console.log('placement', {
      scanResult,
      matchSide,
      availableSide,
      rotateMatch: this.util.rotationDelta(matchSide, availableSide)
    })
    placement.rotation = this.util.matchRotation(scanResult.side, availableSide);

    newTile.place(placement);
    this.updateCache(newTile);

    resolve(newTile);
    
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
Query.prototype.coords = function(val) { return new RegExp('(\\d*)\\.(\\d*)\\-(' + val[0] + ')\\,(' + val[1] + ')'); }
Query.prototype.id = function(val) { return new RegExp('(' + val + ')\\.(\\d*)\\-(\\d*)\\,(\\d*)'); }




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

function Tile(tile, index) {
  this.index = index;
  this.value = tile;
  this.lib = ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]];
  this.scan = ['' + tile[1] + tile[0], '' + tile[2] + tile[1], '' + tile[3] + tile[2], '' + tile[0] + tile[3]];
  this.neighbors = [null, null, null, null];
}

Tile.prototype.place = function(placeObj) {
  this.x = placeObj.x;
  this.y = placeObj.y;
  this.rotate(placeObj.rotation);

  return this;
}

Tile.prototype.rotate = function(rotation) {
  this.rotation = rotation;
  this.placeString = this.generatePlaceString();
}

Tile.prototype.generatePlaceString = function() {
  return `${this.index}.${this.rotation}-${this.x},${this.y};`;
}

Tile.prototype.addNeighbor = function(idx, tileId) {
  this.neighbors[idx] = tileId;
}

module.exports = new Board();