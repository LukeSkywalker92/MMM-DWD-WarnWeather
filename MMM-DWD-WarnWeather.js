Module.register("MMM-DWD-WarnWeather", {
	// Default module config.
	defaults: {
		region: 'Kreis Lörrach',
		changeColor: true,
		interval: 10 * 60 * 1000, // every 10 minutes
		title: 'Wetterwarnungen',
		loadingText: 'Warnungen werden geladen...',
		noWarningText: 'Keine Warnungen'
	},

	getScripts: function () {
		return ["moment.js"];
	},

	getStyles: function () {
		return ["MMM-DWD-WarnWeather.css"]
	},

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

	updateWarnings: function (self) {
		self.sendSocketNotification('GET_WARNINGS', self.config.region);
		setTimeout(self.updateWarnings, self.config.interval, self);
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = 'wrapper';
		var title = document.createElement("div");
		title.className = 'title';
		title.innerHTML = this.config.title;
		wrapper.appendChild(title);
		var lineWrapper = document.createElement("div");
		lineWrapper.className = 'line';
		var line = document.createElement("hr");
		lineWrapper.appendChild(line);
		wrapper.appendChild(lineWrapper);

		if (!this.loaded) {
			var loading = document.createElement("p");
			loading.className = 'status';
			loading.innerHTML = this.config.loadingText;
			wrapper.appendChild(loading);
			return wrapper;
		}

		if (this.warnings.length < 1) {
			var noWarningWrapper = document.createElement("p");
			noWarningWrapper.className = 'status';
			noWarningWrapper.innerHTML = this.config.noWarningText;
			wrapper.appendChild(noWarningWrapper);
			return wrapper;
		}



		for (var i = 0; i < this.warnings.length; i++) {
			var start = moment(this.warnings[i]['start']).format("DD.MM.YY, HH") + ' Uhr';
			var end = moment(this.warnings[i]['end']).format("DD.MM.YY, HH") + ' Uhr';
			var level = this.warnings[i]['level'];
			var type = this.warnings[i]['type'];
			var event = this.warnings[i]['event'];
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
		if (notification === 'WARNINGS_DATA') {
			Log.info(payload);
			this.warnings = payload;
			//Log.info(this.warnings);
			this.loaded = true;
			this.noWarnings = false;
			this.updateDom(1000);
		} else if (notification === 'NO_WARNINGS') {
			this.loaded = true;
			this.noWarnings = true;
			this.updateDom(1000);
		}
	}
});
