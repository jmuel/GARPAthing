var app = require('app');
var etree = require('elementTree');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var Tail = require('tail').Tail;
var fs = require('fs');
var _ = require('lodash');
var https = require('https');
var encoding = require('encoding');

var systems = JSON.parse(fs.readFileSync(__dirname + '/systems.json'));

var systemNameExists = function(systemName) {
	return undefined !== _.find(systems.Systems, function(system) {
		return system.name === systemName;
	});
};

var lineRegex = /\[ (\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) \] ([\w ]+) > (.*)/i;

var findRealCharacters = function(potentialCharacters, callback) {
	https.get('https://api.eveonline.com/Eve/CharacterID.xml.aspx?names=' + potentialCharacters.join(","), function(response) {
		var result = '';
		response.on('data', function(chunk) {result += chunk});
		response.on('end', function() {
			var xml = etree.parse(result);
			var characters = _.reduce(xml.findAll('./result/rowset/row'), function(validCharacters, row) {
				var charId = parseInt(row.attrib.characterID);
				if(charId !== 0) {
					validCharacters.push(row.attrib.name);
				}
				return validCharacters;
			}, []);
			callback(characters);
		});
	});
};

var processLine = function(line, target) {
	var buffer = encoding.convert(line, 'utf-16');
	var result = lineRegex.exec(buffer.slice(7).toString().replace(/\0/g,''));
	if(result) {
		target.send('line-from-file', line);
	}
};

var mainWindow = null;
app.on('window-all-close', function() {
	if(process.platform != 'darwin')
		app.quit();
});

app.on('ready', function() {
	mainWindow = new BrowserWindow({width: 800, height: 600});
	mainWindow.loadUrl('file://' + __dirname + '/index.html');
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
	mainWindow.webContents.on('did-finish-load', function() {
		var tail = new Tail(__dirname + '/inputTest.txt');
		tail.on('line', function(data) {
			processLine(data, mainWindow.webContents);
		});
	});
});
