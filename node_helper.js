/* Magic Mirror
 * Module: MMM-DWD-WarnWeather
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-DWD-WarnWeather helper started...')
	},

	getWarningData: function (region) {
		var self = this;

		var timestamp = Date.now().toString();
		var url = 'http://www.dwd.de/DWD/warnungen/warnapp_landkreise/json/warnings.json?jsonp=loadWarnings' + timestamp;



		request({
			url: url,
			method: 'GET'
		}, function (error, response, body) {

			var result = JSON.parse(body.substr(24).slice(0, -2));
			var warningData = [];
			for (var regionId in result['warnings']) {
				if (result['warnings'][regionId][0]['regionName'] == region) {
					var warnings = [];
					for (var warning in result['warnings'][regionId]) {
						warnings.push(result['warnings'][regionId][warning]);
					}
					if (warnings.length > 0) {
						warningData = warnings;
					}
				}
			}
			self.sendSocketNotification('WARNINGS_DATA', {warnings: warningData, region: region});

		});


	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === 'GET_WARNINGS') {
			this.getWarningData(payload);
		}
	}

});
