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
		longversion: false,
		minutes: true,
		displayRegionName: true,
		longRegionName: false,
    		width: 55,
		changeColor: true,
		interval: 10 * 60 * 1000, // every 10 minutes
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
		this.icons = {
			THUNDERSTORM: 'sprite-gewitter',
			WIND:         'sprite-sturm',
			TORNADO:      'sprite-sturm',
			RAIN:         'sprite-regen',
			HAIL:         'sprite-schnee',
			SNOWFALL:     'sprite-schnee',
			SNOWDRIFT:    'sprite-schnee',
			FOG:          'sprite-nebel',
			FROST:        'sprite-frost',
			GLAZE:        'sprite-glatteis',
			THAW:         'sprite-tauwetter',
			HEAT:         'sprite-hitze',
			UV:           'sprite-uv'
		}

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
		wrapper.className = 'wrapper'

		var header = document.createElement("header");
		header.innerHTML = 'Wetterwarnungen';
		if (this.config.displayRegionName) {
			if (this.warnings.length > 0 && this.config.longRegionName) {
				header.innerHTML += ' für:<br>' + this.warnings[0].NAME;
			}
			else {
				header.innerHTML += ' für ' + this.config.region;
			}
		}
		wrapper.appendChild(header);

		// Check if warning data was loaded
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
			timeDisplayFormat = this.config.minutes ? "dd. HH:mm" : "dd. HH"
			var start = moment(this.warnings[i].ONSET).format(timeDisplayFormat) + ' Uhr';
			var end = moment(this.warnings[i].EXPIRES).format(timeDisplayFormat) + ' Uhr';
			var type = this.warnings[i].EC_GROUP.split(';')[0];
			if (this.config.longversion) {
				var event = this.wordwrap(this.warnings[i].DESCRIPTION, this.config.width, "<BR>");
			} else {
				var event = this.warnings[i].EVENT;
			}
			var warnWrapper = document.createElement("div");
			warnWrapper.className = 'warning';
			var icon = document.createElement("div");
			if (this.config.changeColor) {
				iconColor = this.warnings[i].EC_AREA_COLOR.replace(/ /g, ',');
				icon.setAttribute('style', 'background-color: rgb(' + iconColor + ')');
				icon.classList.add('weathericon', this.icons[type], 'small-icon');
			} else {
				icon.setAttribute('style', 'background-color: white');
				icon.classList.add('weathericon', this.icons[type], 'small-icon');
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
     wordwrap: function (str, width, brk) {

         brk = brk || "n";
         width = width || 75;

         if (!str) {
             return str;
         }

        var re = new RegExp(".{1," + width +
             "}(\\s|$)|\\ S+?(\\s|$)", "g");

         return str.match(RegExp(re)).join(brk);
      },


	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);
		if (notification === 'WARNINGS_DATA' && payload.region == this.config.region) {
			Log.info(payload);
			this.warnings = payload.warnings;
			this.loaded = true;
			this.noWarnings = false;
			this.updateDom(1000);
		} else if (notification === 'NO_WARNINGS' && payload.region == this.config.region) {
			this.loaded = true;
			this.noWarnings = true;
			this.updateDom(1000);
		}
	}
});
