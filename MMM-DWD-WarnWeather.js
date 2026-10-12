/* global Module */

/* Magic Mirror
 * Module: MMM-DWD-WarnWeather
 *
 * By Luke Scheffler https://github.com/LukeSkywalker92
 * MIT Licensed.
 *
 * extended by the possibility to only request warnings higher than a certain warning level
 * By @spitzlbergerj
 *
 * extended by the possibility to hide header.innerHTML
 * By @spitzlbergerj
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
		noWarningText: 'Keine Warnungen',
		noWarningTextGreater: ' ab Warnstufe Level ',
		severityThreshold: 1,
		// hide header.innerHTML
		displayInnerHeader: true,
		hideNoWarning: false, // hide module if there is no warning
	},
	// Required scrpits
	getScripts: function () {
		return ["moment.js"];
	},
	// Required styles
	getStyles: function () {
		return ["MMM-DWD-WarnWeather.css"]
	},
	getTemplate: function () {
		return "templates/default.njk";
	},
	getTemplateData: function () {
		var data = {
			config: this.config,
			warnings: []
		};
		var communityName = this.communityName();
		data.communityName = communityName;
		data.showRegionName = this.config.displayRegionName && this.loaded && !!communityName;

		if (!this.loaded) {
			data.status = this.config.loadingText;
			return data;
		}

		// DWD answered, but found no single municipality for the region or cell
		if (!communityName) {
			data.status = "Ort nicht gefunden";
			return data;
		}

		if (this.warnings.length < 1) {
			if (this.config.severityThreshold < 2) {
				data.status = this.config.noWarningText;
			} else {
				data.status = this.config.noWarningText + this.config.noWarningTextGreater + this.config.severityThreshold;
			}
			return data;
		}

		var self = this;
		data.warnings = this.warnings.map(function (warning) {
			var timeDisplayFormat = self.config.minutes ? "dd. HH:mm" : "dd. HH";
			var start = moment(warning.properties.ONSET).format(timeDisplayFormat) + " Uhr";
			var end = moment(warning.properties.EXPIRES).format(timeDisplayFormat) + " Uhr";
			var type = warning.properties.EC_GROUP.split(";")[0];
			var event = self.config.longversion ? warning.properties.DESCRIPTION : warning.properties.EVENT;
			var iconColor = self.config.changeColor ? warning.properties.EC_AREA_COLOR.replace(/ /g, ",") : "255,255,255";
			return {
				start: start,
				end: end,
				event: event,
				iconClass: self.icons[type] || "",
				iconStyle: "background-color: rgb(" + iconColor + ")",
				maxWidthCh: self.config.longversion && self.config.width ? self.config.width : null
			};
		});

		return data;
	},
	// The name of the municipality that DWD found for the region or cell, or null
	communityName: function () {
		return this.community && this.community.properties && this.community.properties.NAME || null;
	},
	// Define parameters at start
	start: function () {
		this.loaded = false;
		this.noWarnings = false;
		this.warnings = [];
		this.community = [];
		this.selfHidden = false;
		this.icons = {
			THUNDERSTORM: 'sprite-gewitter',
			WIND: 'sprite-sturm',
			TORNADO: 'sprite-sturm',
			RAIN: 'sprite-regen',
			HAIL: 'sprite-schnee',
			SNOWFALL: 'sprite-schnee',
			SNOWDRIFT: 'sprite-schnee',
			FOG: 'sprite-nebel',
			FROST: 'sprite-frost',
			GLAZE: 'sprite-glatteis',
			SLIPPERINESS: 'sprite-glatteis',
			THAW: 'sprite-tauwetter',
			HEAT: 'sprite-hitze',
			UV: 'sprite-uv'
		}

		this.updateWarnings(this);
	},

	// Make node_helper to get new warning-data
	updateWarnings: function (self) {
		if (self.config.region) {
			var regionThreshold = { reg: self.config.region, sevThres: self.config.severityThreshold };
			self.sendSocketNotification('GET_WARNINGS', regionThreshold);
		}
		else if (self.config.warnCellID) {
			var cellIDThreshold = { cellid: self.config.warnCellID, sevThres: self.config.severityThreshold };
			self.sendSocketNotification('GET_WARNINGS', cellIDThreshold);
		}
		else if (self.config.lat && self.config.lng) {
			var coordsThreshold = { lat: self.config.lat, lng: self.config.lng, sevThres: self.config.severityThreshold };
			self.sendSocketNotification('GET_WARNINGS', coordsThreshold);
		}
		setTimeout(self.updateWarnings, self.config.interval, self);
	},

	// No header while hideNoWarning hides the module, also not in the first
	// frame before MODULE_DOM_CREATED
	getHeader: function () {
		if (this.isEmpty()) {
			return "";
		}
		return this.data.header;
	},

	// With hideNoWarning the module has nothing to show while it loads and while
	// there is no warning. 'Ort nicht gefunden' is shown, so that a wrong region
	// or cell is not hidden.
	isEmpty: function () {
		return this.config.hideNoWarning && (!this.loaded || (!!this.communityName() && this.warnings.length < 1));
	},

	// With hideNoWarning the module starts hidden, like the newsfeed with hideLoading
	notificationReceived: function (notification) {
		if (notification === "MODULE_DOM_CREATED" && this.isEmpty()) {
			this.selfHidden = true;
			this.hide(0, function () {}, { lockString: this.identifier });
		}
	},

	// Shows new data. hideNoWarning uses MagicMirror's hide() and show(), so that
	// the hidden module takes no space. The lockString keeps a hide by another
	// module in force.
	showData: function () {
		var lock = { lockString: this.identifier };
		if (this.isEmpty()) {
			// The old content stays while the module fades out
			if (!this.selfHidden) {
				this.selfHidden = true;
				this.hide(1000, function () {}, lock);
			}
			return;
		}
		// While the module is hidden, MagicMirror replaces the content at once
		this.updateDom(1000);
		if (this.selfHidden) {
			this.selfHidden = false;
			this.show(1000, function () {}, lock);
		}
	},

	pointInPoly: function (point, vs) {
		// ray-casting algorithm based on
		// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

		var x = point[0], y = point[1];

		var inside = false;
		for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			var xi = vs[i][0], yi = vs[i][1];
			var xj = vs[j][0], yj = vs[j][1];

			var intersect = ((yi > y) !== (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}

		return inside;
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(notification);

		if (notification === 'WARNINGS_DATA') {
			// Without geometry DWD found no single municipality for the region or cell.
			// Such an answer is accepted too, so that 'Ort nicht gefunden' is shown
			// instead of the loading text forever.
			var located = payload.community.hasOwnProperty('geometry');
			if (payload.region === this.config.region || payload.region === this.config.warnCellID
				|| (located && this.pointInPoly([this.config.lng, this.config.lat], payload.community.geometry.coordinates[0]))) {
				Log.info(payload);
				this.warnings = payload.warnings;
				this.community = payload.community;
				this.loaded = true;
				this.noWarnings = false;
				this.showData();
			}
		}
	}
});
