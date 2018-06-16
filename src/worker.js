const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var arg = require('minimist')(process.argv.slice(2))['_'];
console.log(arg)

const port = arg[0]
app.listen(port, () => console.log('Server running on port ' + port));

const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const Translate = require('@google-cloud/translate');

const client = new speech.SpeechClient();
const translate = new Translate();

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;

const countryLanguageCode = {
	'US': 'en-US',
	'CN': 'zh-Hans',
}
const interimResult = true;

const inputCountry = arg[1];
const outputCountry = arg[2];
translateAudio(inputCountry, outputCountry);

const processName = arg[3];

function translateAudio(input, output) {
	const inputCountry = countryLanguageCode[input];
	const outputCountry = countryLanguageCode[output];
	const request = {
	  config: {
		encoding: encoding,
		sampleRateHertz: sampleRateHertz,
		languageCode: inputCountry,
	  },
	  interimResults: interimResult,
	};

	// Stream the audio to the Google Cloud Speech API
	const recognizeStream = client
	  .streamingRecognize(request)
	  .on('error', console.error)
	  .on('data', function(data){
		var recordedText = data.results[0].alternatives[0].transcript;
		console.log(processName + ' recorded text: ' + recordedText);
		translateAsync(recordedText, outputCountry);
	  });

	record
	  .start({
		sampleRateHertz: sampleRateHertz,
		threshold: 0,
		verbose: false,
		recordProgram: 'rec', // Try also "arecord" or "sox"
		silence: '10.0',
	  })
	  .on('error', console.error)
	  .pipe(recognizeStream);

	console.log('Listening, press Ctrl+C to stop.');
}


function translateAsync(text, target) {
	translate
	  .translate(text, target)
	  .then(results => {
		let translations = results[0];
		translations = Array.isArray(translations)
		  ? translations
		  : [translations];

		
		console.log(processName + ' Translations:');
		translations.forEach((translation, i) => {
		  console.log(`${text[i]} => (${target}) ${translation}`);
		});
	  })
	  .catch(err => {
		console.error('ERROR:', err);
	  });
}
