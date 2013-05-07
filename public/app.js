/*globals io, GMaps, _, google*/

(function ($) {

	'use strict';

	var map;
	var players = []; //hold all active players

	//API Doc:
	//http://hpneo.github.io/gmaps/documentation.html#GMaps-drawCircle
	var _drawCircle = function (lat, lng, radius) {

		var options = {
			index: 0,
			strokeColor: '#CD0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#2E6444',
			fillOpacity: 0.5,
			lat: lat,
			lng: lng,
			radius: radius
		};

		return map.drawCircle(options);
	};

	//API Doc:
	//http://hpneo.github.io/gmaps/documentation.html#GMaps-addMarker
	//Example:
	//http://hpneo.github.io/gmaps/examples/markers.html
	var _updatePlayerMarker = function (data) {

		//Note: I'm not sure why this happend,
		//but data.lat got deleted after map.addMarker
		//hence storing values from data inside variables...
		//too lazy to debug, not a big deal IMO
		var lat = data.lat,
			lng = data.lng,
			radius = data.radius,
			hitTimeout = data.hitTimeout,
			marker,
			oldCircle;

		marker = map.addMarker(data);

		if (data.isHit) {

			oldCircle = _drawCircle(lat, lng, radius);

			//remove the circle after 2 seconds (default value)
			setTimeout(function () {
				oldCircle.setMap(null);
			}, hitTimeout);
		}

		return marker;
	};

	var _createPlayer = function (data) {
		var p = new Player(data.title);
		players.push(p);
		p.update(data);
		return p;
	};

	var _updatePlayerObject = function (player, data) {
		player.clear();
		player.update(data);
	};

	//Returns the player object (if found) or undefined (not found)
	var _locatePlayer = function (player, data) {
		return _.find(players, function (player) {
			return player.title === data.title;
		});
	};

	//Proper JavaScript Object, remember to use 'new' (e.g. new Player(...))
	var Player = function (title) {
		this.title = title;
		this.marker = null;//default value, see prototype.clear
	};

	Player.prototype.update = function (data) {
		this.marker = _updatePlayerMarker(data);
	};

	Player.prototype.clear = function () {
		//default value is null, see Player this.marker
		if(! _.isNull(this.marker)) {
			this.marker.setMap(null);
		}
	};

	$(document).ready(function () {

		//Handle updates to the player's locations
		var socket = io.connect('http://localhost');
		socket.on('updateMarker', function (data) {

			var player;

			//no players in the array
			if (_.isEmpty(players)) {
				_createPlayer(data);

			} else { //players exist in the array

				//find the player using data.title (e.g. 'player1')
				player = _locatePlayer(player, data);

				if (_.isObject(player)) {
					//player found, update it
					_updatePlayerObject(player, data);
				} else {
					//player not found, create it
					_createPlayer(data);
				}
			}


		});//end updateMarker socket.io event

		//Create the map
		socket.on('createMap', function (data) {
			map = new GMaps(data);
		});

	});//end jQuery ready

}(jQuery));