const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

/*app.get('/', (req, res) => {
  res.send("Hello world")
});*/

app.use(express.static(__dirname + '/' + '../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => console.log('Server running on port 3000'));
