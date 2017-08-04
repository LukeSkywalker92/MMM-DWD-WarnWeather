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

		var regionFilter = encodeURIComponent("AREADESC='" + region + "'");
		var url = 'https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warnungen_Gemeinden&outputFormat=application%2Fjson&CQL_FILTER=' + regionFilter;

		request({
			url: url,
			method: 'GET'
		}, function (error, response, body) {

			var result = JSON.parse(body);
			var warningData = [];

			if (result.totalFeatures > 0) {
				for (var i = 0; i < result.totalFeatures; i++) {
					warningData.push(result.features[i].properties);
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
