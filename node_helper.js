var NodeHelper = require('node_helper');
var Curl = require('node-libcurl').Curl;

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-DWD-WarnWeather helper started...')
	},

	getWarningData: function (region) {
		var self = this;
		var curl = new Curl();
		var timestamp = Date.now().toString();
		var url = 'http://www.dwd.de/DWD/warnungen/warnapp_landkreise/json/warnings.json?jsonp=loadWarnings' + timestamp;

		curl.setOpt('URL', url);
		curl.setOpt('FOLLOWLOCATION', true);

		curl.on('end', function (statusCode, body, headers) {

			var result = JSON.parse(body.substr(24).slice(0, -2));
			for (var regionId in result['warnings']) {
				if (result['warnings'][regionId][0]['regionName'] == region) {
					var warnings = [];
					for (var warning in result['warnings'][regionId]) {
						warnings.push(result['warnings'][regionId][warning]);
					}
					if (warnings.length > 0) {
						self.sendSocketNotification('WARNINGS_DATA', warnings);
					}
					console.log(warnings);
				} else {
						self.sendSocketNotification('NO_WARNINGS', 'no_warnings');
					}
			}


			console.info(statusCode);
			console.info('---');
			//console.info(body);
			console.info('---');
			console.info(this.getInfo('TOTAL_TIME'));


			this.close();
		});

		curl.on('error', curl.close.bind(curl));
		curl.perform();
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === 'GET_WARNINGS') {
			this.getWarningData(payload);
		}

		console.log(notification);
		console.log(payload);
	}

});
