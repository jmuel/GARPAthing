var app = require('app');
var fs = require('fs');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var Tail = require('tail').Tail;

var mainWindow = null;
app.on('window-all-close', function() {
	if(process.platform != 'darwin')
		app.quit();
});

app.on('ready', function() {
	mainWindow = new BrowserWindow({width: 800, height: 600});
//	mainWindow.loadUrl('file://' + __dirname + '/index.html');
	mainWindow.loadUrl('http://www.google.com');
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
//	mainWindow.webContents.on('did-finish-load', function() {
//		var tail = new Tail(__dirname + '/test.txt');
//		tail.on('line', function(data) {
//			mainWindow.webContents.send('line-from-file', data);
//		});
//	});

});
