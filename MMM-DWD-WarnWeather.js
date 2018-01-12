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
		this.community = [];
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
		if (self.config.region) {
		  self.sendSocketNotification('GET_WARNINGS', self.config.region);
	  }
		else if (self.config.lat && self.config.lng) {
			var coords = {lat:self.config.lat, lng:self.config.lng};
			self.sendSocketNotification('GET_WARNINGS', coords);
		}
		setTimeout(self.updateWarnings, self.config.interval, self);
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = 'wrapper';

		var header = document.createElement("header");
		if (this.community.hasOwnProperty('properties')){
			header.innerHTML = 'Wetterwarnungen';
			if (this.config.displayRegionName && this.loaded) {
				header.innerHTML += ' für:<br>' + this.community.properties.NAME;
			}
		} else {
			header.innerHTML = 'Ort nicht gefunden';
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
			timeDisplayFormat = this.config.minutes ? "dd. HH:mm" : "dd. HH";
			var start = moment(this.warnings[i].properties.ONSET).format(timeDisplayFormat) + ' Uhr';
			var end = moment(this.warnings[i].properties.EXPIRES).format(timeDisplayFormat) + ' Uhr';
			var type = this.warnings[i].properties.EC_GROUP.split(';')[0];
			if (this.config.longversion) {
				var event = this.wordwrap(this.warnings[i].properties.DESCRIPTION, this.config.width, "<BR>");
			} else {
				var event = this.warnings[i].properties.EVENT;
			}
			var warnWrapper = document.createElement("div");
			warnWrapper.className = 'warning';
			var icon = document.createElement("div");
			if (this.config.changeColor) {
				iconColor = this.warnings[i].properties.EC_AREA_COLOR.replace(/ /g, ',');
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

	pointInPoly: function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];

      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);

		if (notification === 'WARNINGS_DATA') {
			if(payload.community.hasOwnProperty('geometry')){
				if (payload.region == this.config.region || this.pointInPoly([this.config.lng, this.config.lat], payload.community.geometry.coordinates[0])){
					Log.info(payload);
					this.warnings = payload.warnings;
					this.community = payload.community;
					this.loaded = true;
					this.noWarnings = false;
					this.updateDom(1000);
				}
			}
		}
	}
});
