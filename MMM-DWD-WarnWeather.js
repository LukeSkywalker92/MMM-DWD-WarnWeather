Module.register("MMM-DWD-WarnWeather",{
    // Default module config.
    defaults: {
		region: 'Kreis Lörrach',
		interval:60000, //milliseconds
		changeColor: false,
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
		this.updateWarnings(this);
	},

	updateWarnings: function (self) {
		self.sendSocketNotification('GET_WARNINGS', self.config.region);
		setTimeout(self.updateWarnings, self.config.interval, self);
	},

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = this.config.loadingText;
			return wrapper;
		}

		/*if (this.noWarnings) {
			wrapper.innerHTML = this.config.noWarningText;
			return wrapper;
		}*/

		var icon1 = document.createElement("i");
		icon1.classList.add('sprite', 'sprite-sturm', 'red', 'small-icon');
		var icon2 = document.createElement("i");
		icon2.classList.add('sprite', 'sprite-sturm', 'red', 'small-icon');
        wrapper.appendChild(icon1);
		wrapper.appendChild(icon2);

        return wrapper;
    },

	socketNotificationReceived: function (notification, payload) {
			Log.info(notification);
		if (notification === 'WARNINGS_DATA') {
			Log.info(payload);
			this.warnings = payload;
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
