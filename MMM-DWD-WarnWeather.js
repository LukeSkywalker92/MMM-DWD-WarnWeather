/* global Module */

/* Magic Mirror
 * Module: MMM-DWD-WarnWeather
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 */

Module.register("MMM-DWD-WarnWeather", {
	// Default module config.
	defaults: {
		region: '',
		changeColor: true,
		interval: 10 * 60 * 1000, // every 10 minutes
		title: 'Wetterwarnungen',
		loadingText: 'Warnungen werden geladen...',
		noWarningText: 'Keine Warnungen'
	},
	// Required scrpits
	getScripts: function () {
		return ["moment.js"];
	},
	// Required styles
	getStyles: function () {
		return ["MMM-DWD-WarnWeather.css"]
	},
	// Define parameters at start
	start: function () {
		this.loaded = false;
		this.noWarnings = false;
		this.warnings = [];
		this.icons = [
			'sprite-gewitter',
			'sprite-sturm',
			'sprite-regen',
			'sprite-schnee',
			'sprite-nebel',
			'sprite-frost',
			'sprite-glatteis',
			'sprite-tauwetter',
			'sprite-hitze',
			'sprite-uv',
			'sprite-kueste',
			'sprite-binnensee',
			'sprite-sea'

		]
		this.updateWarnings(this);
	},

	// Make node_helper to get new warning-data
	updateWarnings: function (self) {
		self.sendSocketNotification('GET_WARNINGS', self.config.region);
		setTimeout(self.updateWarnings, self.config.interval, self);
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = 'wrapper';

		// Check if warning data was loadet
		if (!this.loaded) {
			var loading = document.createElement("p");
			loading.className = 'status';
			loading.innerHTML = this.config.loadingText;
			wrapper.appendChild(loading);
			return wrapper;
		}

		// Check if there are warnings for defined region
		if (this.warnings.length < 1) {
			var noWarningWrapper = document.createElement("p");
			noWarningWrapper.className = 'status';
			noWarningWrapper.innerHTML = this.config.noWarningText;
			wrapper.appendChild(noWarningWrapper);
			return wrapper;
		}


		// Display warnings
		for (var i = 0; i < this.warnings.length; i++) {
			var start = moment(this.warnings[i]['start']).format("dd. HH") + ' Uhr';
			var end = moment(this.warnings[i]['end']).format("dd. HH") + ' Uhr';
			var level = this.warnings[i]['level'];
			var type = this.warnings[i]['type'];
			var event = this.warnings[i]['event'];
			if (this.warnings[i]['altitudeStart'] != null) {
				event += ' (ab '+ this.warnings[i]['altitudeStart'].toString() + ' m)'
			}
			var warnWrapper = document.createElement("div");
			warnWrapper.className = 'warning';
			var icon = document.createElement("div");
			if (this.config.changeColor) {
				icon.classList.add('sprite' + level, this.icons[type], 'small-icon');
			} else {
				icon.classList.add('spritewhite', this.icons[type], 'small-icon');
			}
			var description = document.createElement("div");
			description.className = 'description';
			var headline = document.createElement("div");
			headline.innerHTML = event;
			var duration = document.createElement("div");
			duration.className = 'duration';
			duration.innerHTML = start + ' - ' + end;
			var newLine = document.createElement("br");
			description.appendChild(headline);
			description.appendChild(duration);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(description);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(newLine);

		}

		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);
		if (notification === 'WARNINGS_DATA' && payload['region'] == this.config.region) {
			Log.info(payload);
			this.warnings = payload['warnings'];
			this.loaded = true;
			this.noWarnings = false;
			this.updateDom(1000);
		} else if (notification === 'NO_WARNINGS' && payload['region'] == this.config.region) {
			this.loaded = true;
			this.noWarnings = true;
			this.updateDom(1000);
		}
	}
});
