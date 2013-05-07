/*globals require, __dirname, console*/
'use strict';

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

server.listen(3000);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	console.log('dsfsdfd');
	res.sendfile(__dirname + '/public/index.html');
});


io.sockets.on('connection', function (socket) {

	socket.emit('createMap', {
		div: '#map',
		lat: -12.133333,
		lng: -77.028333,
		zoom: 4
	});

	setInterval(function () {

		var icon, title;

		if ([true,false][Math.round(Math.random())]) {
			icon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
			title = 'player1';
		} else {
			icon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
			title = 'player2';
		}

		socket.emit('updateMarker', {
			title: title,
			lat: -12.043333 + (10 * Math.random()),
			lng: -77.028333 + (10 * Math.random()),
			isHit: [true,false][Math.round(Math.random())],
			radius: 100000,
			icon: icon,
			hitTimeout: 2000
		});

	}, 1000);

});
