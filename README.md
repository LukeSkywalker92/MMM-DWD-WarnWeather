Dokumentation DWD: https://www.dwd.de/DE/leistungen/opendata/help/warnungen/cap_dwd_profile_de_pdf.pdf

Farbcodes
Warnungstyp 		Farbe 		CAP (RGB)

Keine 			Hellblau	-

Vorabinformation 	Rosa		255, 128, 128

Wetterwarnung 		Gelb		255, 255, 0

Markantes Wetter 	Orange		255, 153, 0

Unwetterwarnung 	Rot		255, 0, 0

Extreme Wetterwarnung 	Violett		175, 0, 100


MMM-DWD-WarnWeather
===================
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). It can display weather-warnings of [Deutscher Wetterdienst](http://www.dwd.de/DE/Home/home_node.html). The module shows you current weather-warnings of your region in Germany.

## Preview

![](https://github.com/LukeSkywalker92/MMM-DWD-WarnWeather/blob/master/screenshot.png?raw=true)

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/LukeSkywalker92/MMM-DWD-WarnWeather.git`. A new folder will appear, navigate into it.
2. Execute `npm install` to install the node dependencies.



## Config
The entry in `config.js` can include the following options:

|Option|Description|
|---|---|
|`region`|now using the new more detailed DWD API.<br><br>To find the correct region name:<br><ul><li>go [here](https://maps.dwd.de/geoserver/dwd/wms?service=WMS&version=1.1.0&request=GetMap&layers=dwd:Warngebiete_Gemeinden&styles=&bbox=5.876914,47.270362,15.037507,55.044381&width=1024&height=868&srs=EPSG:4326&format=application/openlayers#)</li><li>toggle options toolbar (three dots at the top left)</li><li>if necessary enter "NAME LIKE '%&lt;your region name&gt;%'" at the top right next to the 'CQL' dropdown</li><li>optional: change style in dropdown from "Default" to "Warngebiete_Gemeinden_Text" for easier selection</li><li>click on your city/town/community/area...</li><li>the correct region name is DWD_NAME from the table below the map (case sensitive!)</li></ul><br>**Type:** `string`<br>Use **either** this **or** `lat` and `lng`.|
|`lat`|Latitude of the place to check.<br><br>Use **either** this and `lng` **or** `region`.|
|`lng`|Longitude of the place to check.<br><br>Use **either** this and `lat` **or** `region`.|
|`changeColor`|When `changeColor` is set to true, the color of the warning icons will change based on the warning level. <br><br>**Default value:** `true`|
|`interval`|How often the warnings are updated.<br><br>**Default value:** `10 • 60 • 1000` // every 10 minutes|
|`longversion`|Show the full Description of Warnings if true.<br><br>**Default value:** `false`|
|`width`|set the piont, where the full Description break down.<br><br>**Default value:** `55`|
|`minutes`|show minutes in start ad end time information<br><br>**Default value:** `true`|
|`displayRegionName`|show region name in header info<br><br>**Default value:** `true`|
|`loadingText`|The text used while loading warnings.<br><br>**Default value:** `'Warnungen werden geladen...'`|
|`noWarningText`|The text used when there are no warnings for your region.<br><br>**Default value:** `'Keine Warnungen'`|


Here is an example of an entry in `config.js`
```
{
	module: 'MMM-DWD-WarnWeather',
	position: 'top_left',
	header: 'Wetterwarnungen',
	config: {
		region: 'Kreis Lörrach',
		changeColor: true,
		minutes: false,
		displayRegionName: true,
		interval: 10 * 60 * 1000, // every 10 minutes
		loadingText: 'Warnungen werden geladen...',
		noWarningText: 'Keine Warnungen'
	}
},
```

## Dependencies
- [request](https://www.npmjs.com/package/request) (installed via `npm install`)

## Important Notes
- This is my first project using Node, so feel free to submit pull requests or post on the issues/wiki and I will do my best to improve the project.
- Right now the data for warnings comes from the *Deutsche Wetterdienst*. So the warnings are only available for germany. If you find an similar API for other countries, feel free to give me a hint or to implement this API in this module yourself.

- Because it's only data for germany, i did not translate any of the warnings to english. Also feel free to do that.

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [SamLewis0602](https://github.com/SamLewis0602) for creating the [MMM-Traffic](https://github.com/SamLewis0602/MMM-Traffic) module that I used as guidance in creating this module.
