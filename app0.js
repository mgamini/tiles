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
	this.x = {max: 0, min: 0};
	this.y = {max: 0, min: 0};
	// v2 // this.rowCache = {};
	this.cache = '';
	this.library = [];
}

Board.prototype.add = function(input) {
	let loc   = [0,0];
	let tile;

	if (!this.library.length) {
		// v2 // this.rows[0] = '0.0-0,0';
		this.cache = '0.0-0,0';
		this.library = this.flatten(input).lib;
		return;
	}

	tile = this.flatten(input);
	this.scan(tile.scan);
	// this.library = this.library.concat(input);


}

// a = require('./app');
// a.add([1,2,3,4]);

a.scan(a.flatten([1,2,3,4]).scan).then((res) => console.log(res)).catch((err) => console.log(err))
a.scan(a.flatten([2,9,8,3]).scan).then((res) => console.log(res)).catch((err) => console.log(err))

Board.prototype.flatten = function(tile) {
	return {
		lib: ['' + tile[0] + tile[1], '' + tile[1] + tile[2], '' + tile[2] + tile[3], '' + tile[3] + tile[0]],
		scan: ['' + tile[1] + tile[0], '' + tile[2] + tile[1], '' + tile[3] + tile[2], '' + tile[0] + tile[3]]
	};
}

Board.prototype.place = function(tile) {

}

// input = []
Board.prototype.scan = function(input) {
	return new Promise((resolve, reject) => {
		const foundMatch = input.some((sideValue, idx) => {
			const match = this.library.indexOf(sideValue);

			if (match !== -1) {
				resolve({idx, match});
				return true;
			}

			return false;
		})

		if (!foundMatch) {
			reject({error: 'Match not found!'});
		}
	});
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