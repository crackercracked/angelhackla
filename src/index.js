const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();


app.use(express.static(__dirname + '/' + '../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => console.log('Server running on port 3000'));

app.get('/main', function(req, res) {
	
});


app.get('/translate', function(req, res){
	const input = req.query.input;
	const output = req.query.output;
	var spawn = require('child_process').spawn;
	
	const name1 = input + '->' + output;
	const child1 = spawn('node', 
    [__dirname + '/worker.js', '4001', input, output, name1]);
  child1.stderr.pipe(process.stdout);
  child1.stdout.pipe(process.stdout);
  
	child1.on('exit', function (code, signal) {
		console.log('child 1 process exited with ' +
						`code ${code} and signal ${signal}`);
	});
	
	const name2 = output + '->' + input;
	const child2 = spawn('node', 
		[__dirname + '/worker.js', '5000', output, input, name2]);
	child2.stdout.pipe(process.stdout);
	child2.on('exit', function (code, signal) {
		console.log('child 2 process exited with ' +
						`code ${code} and signal ${signal}`);
	});
});

