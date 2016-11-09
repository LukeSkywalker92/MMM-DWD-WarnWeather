var NodeHelper = require('node_helper');
var Curl = require('node-libcurl').Curl;

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-DWD-WarnWeather helper started...')
	},

	getWarningData: function () {
		//TODO
	},

	socketNotificationReceived: function (notification, payload) {
		console.log(notification);
		console.log(payload);
	}

});
