const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var arg = require('minimist')(process.argv.slice(2))['_'];
console.error(arg)

const port = arg[0]
app.listen(port, () => console.error('Server running on port ' + port));

const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const Translate = require('@google-cloud/translate');

const client = new speech.SpeechClient();
const translate = new Translate();

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;

const countryLanguageCode = {
	'US': 'en',
	'CN': 'zh-Hans',
	'TA': 'ta'
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
	  .on('data', function(data) {
			if (data && data.results.length > 0) {
				var recordedText = data.results[0].alternatives[0].transcript;
				var confidence = data.results[0].alternatives[0].confidence;
				if (confidence < 0.9) {
					return;
				}
				detectAndTranslateAsync(recordedText,
					inputCountry,
					outputCountry);
			}
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

	console.error('Listening, press Ctrl+C to stop.');
}

function inferDetectionResult(detections) {
 	var largestConf = 0;
	var inferedResult = null;
	var inferedInput = null;
	detections = Array.isArray(detections) ? detections : [detections];
	detections.forEach(detection => {
		var confidence = detection.confidence;
		var input = detection.input;
		var language = detection.language;
		if (confidence > largestConf) {
			largestConf = confidence;
			inferedResult = language;
			inferedInput = input;
		}
	});
	console.error(processName + 
		' Detected conf: ' + largestConf + 
		', input ' + inferedInput + 
		', lang=' + inferedResult);
	return [inferedResult, inferedInput];
}

function detectAndTranslateAsync(text, inputLanguageCode, outputLanguageCode) {
	translate
	  .detect(text)
	  .then(results => {
			let detections = results[0];
			detections = Array.isArray(detections) ? detections : [detections];
			let infered = inferDetectionResult(detections); // [ 'en', 'zha-US' ]
			let inferedLanguageCountryCode = infered[0];
			let inferedInputText = infered[1];
			var actual = inferedLanguageCountryCode.split('-')[0].trim();
			var expect = inputLanguageCode.split('-')[0].trim();
			var match = actual === expect;
			console.error(processName + ' compare infer ' + actual + ', and expect ' + expect + ', match ' + match);
			if (match) {
				console.error('going to translate');
				translateAsync(inferedInputText, outputLanguageCode);
			}		
	  })
	  .catch(err => {
			console.error('ERROR:', err);
	  });	
}

function translateAsync(text, target) {
	translate
	  .translate(text, target)
	  .then(results => {
		let translations = results[0];
		translations = Array.isArray(translations)
		  ? translations
		  : [translations];

		console.error(processName + ' Translations:');
			translations.forEach((translation, i) => {
				console.error(`${text[i]} => (${target}) ${translation}`);
				console.log(translation);
			});
	  })
	  .catch(err => {
			console.error('ERROR:', err);
	  });
}
