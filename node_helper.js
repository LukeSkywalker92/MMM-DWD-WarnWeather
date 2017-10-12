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

		if (region.lng) {
			var regionFilter = encodeURIComponent("CONTAINS(THE_GEOM, POINT(" + region.lng + " " + region.lat + "))");
		}
    else {
		  var regionFilter = encodeURIComponent("AREADESC='" + region + "'");
    }
		var communityData = [];
		var nameurl = 'https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warngebiete_Gemeinden&outputFormat=application%2Fjson&CQL_FILTER=' +
					(regionFilter.includes("AREADESC")?regionFilter.replace("AREADESC", "DWD_NAME"):regionFilter);
		var warnurl = 'https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warnungen_Gemeinden&outputFormat=application%2Fjson&CQL_FILTER=' + regionFilter;

		//get name
		request({
			url: nameurl,
			method: 'GET'
		}, function (error, response, body) {
			var result = JSON.parse(body);

			if (result.totalFeatures == 1) {
				communityData = result.features[0];
			}
		});

		//get warnings
		request({
			url: warnurl,
			method: 'GET'
		}, function (error, response, body) {

			var result = JSON.parse(body);
			var warningData = [];

			if (result.totalFeatures > 0) {
				for (var i = 0; i < result.totalFeatures; i++) {
					warningData.push(result.features[i]);
				}
			}
			self.sendSocketNotification('WARNINGS_DATA', {warnings: warningData, region: region, community: communityData});
		});
	},

	socketNotificationReceived: function (notification, payload) {
    if (notification === 'GET_WARNINGS') {
			this.getWarningData(payload);
		}
	}

});
