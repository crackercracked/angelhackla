const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

//app.use(express.static(__dirname + '/' + '../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => console.log('Server running on port 3000'));

app.get('/translate', function(req, res){
	const input = req.query.input;
	const output = req.query.output;
	var spawn = require('child_process').spawn;
	spawn('node', ['src/worker.js', '4000']);
});

