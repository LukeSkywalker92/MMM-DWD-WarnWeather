Module.register("MMM-DWD-WarnWeather",{
    // Default module config.
    defaults: {
        text: "Test!",
		testnotification: "Testnachricht",
		testpayload: "TestPayload"
    },

	getScripts: function () {
		return ["moment.js"];
	},

	getStyles: function () {
		return ["MMM-DWD-WarnWeather.css"]
	},

	start: function () {
		this.sendSocketNotification("TestNotification", "TestPayload");
		console.log('modul gestartet')
	},

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
		var icon = document.createElement("i");
		icon.classList.add('sprite', 'sprite-binnen');
        wrapper.appendChild(icon);
        return wrapper;
    }
});
