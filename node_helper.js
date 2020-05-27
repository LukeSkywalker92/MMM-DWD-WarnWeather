/* Magic Mirror
 * Module: MMM-DWD-WarnWeather
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 *
 * extended by the possibility to only request warnings higher than a certain warning level
 * By @spitzlbergerj
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-DWD-WarnWeather helper started...')
	},

	dataLoadingComplete: function (self, warningData, region, communityData) {
		self.sendSocketNotification('WARNINGS_DATA', { warnings: warningData, region: region, community: communityData });
	},

	getWarningData: function (region, callback) {
		var self = this;
		var severityStr = " AND SEVERITY IN ('Extreme'";

		if (region.sevThres < 4) {
			severityStr = severityStr + ",'Severe'";
		};
		if (region.sevThres < 3) {
			severityStr = severityStr + ",'Moderate'";
		};
		if (region.sevThres < 2) {
			severityStr = severityStr + ",'Minor'";
		};

		severityStr = encodeURIComponent(severityStr + ")");

		if (region.lng) {
			var regionFilter = encodeURIComponent("CONTAINS(THE_GEOM, POINT(" + region.lng + " " + region.lat + "))");
		}
		else if (region.cellid) {
			var regionFilter = encodeURIComponent("WARNCELLID=" + region.cellid);
		} else {
			var regionFilter = encodeURIComponent("AREADESC='" + region.reg + "'");
		}

		var communityData = [];
		var warningData = [];

		var nameurl = 'https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warngebiete_Gemeinden&outputFormat=application%2Fjson&CQL_FILTER=' +
			(regionFilter.includes("AREADESC") ? regionFilter.replace("AREADESC", "DWD_NAME") : regionFilter);
		// console.error(nameurl);
		var warnurl = 'https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd:Warnungen_Gemeinden&outputFormat=application%2Fjson&CQL_FILTER=' + regionFilter + severityStr;
		// console.error(warnurl);

		var requests = 2;

		//get name
		request({
			url: nameurl,
			method: 'GET'
		}, function (error, response, body) {
			var result = JSON.parse(body);
			if (result.totalFeatures == 1) {
				communityData = result.features[0];
			}
			if (--requests == 0) {
				if (region.reg)
					callback(self, warningData, region.reg, communityData);
				else if (region.cellid)
					callback(self, warningData, region.cellid, communityData);
			}
		});

		//get warnings
		request({
			url: warnurl,
			method: 'GET'
		}, function (error, response, body) {

			var result = JSON.parse(body);

			if (result.totalFeatures > 0) {
				for (var i = 0; i < result.totalFeatures; i++) {
					warningData.push(result.features[i]);
				}
			}
			if (--requests == 0) {
				if (region.reg)
					callback(self, warningData, region.reg, communityData);
				else if (region.cellid)
					callback(self, warningData, region.cellid, communityData);
			}
		});
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === 'GET_WARNINGS') {
			this.getWarningData(payload, this.dataLoadingComplete);
		}
	}

});
