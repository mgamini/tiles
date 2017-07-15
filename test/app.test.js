const fs = require('fs');
// const app = require('./app');

test('adds 1 + 2 to equal 3', () => {
	const input = JSON.parse(fs.readFileSync('./test/input.json'));
	console.log(input);
  expect(1 + 2).toBe(3);
});