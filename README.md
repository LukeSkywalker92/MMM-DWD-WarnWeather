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
|`region`|Your region. Possible region names can be found [here](http://www.dwd.de/DE/wetter/warnungen_landkreise/warnWetter_node.html). Just click on your location and you will see the name.<br><br>**Type:** `string`<br>This value is **REQUIRED**|
|`changeColor`|When `changeColor` is set to true, the color of the warning icons will change based on the warning level. <br><br>**Default value:** `true`|
|`interval`|How often the warnings are updated.<br><br>**Default value:** `10 • 60 • 1000 // every 10 minutes|
|`title`|The text, which is shown over the warnings as a title.<br><br>**Default value:** `'Wetterwarnungen'`|
|`loadingText`|The text used while loading warnings.<br><br>**Default value:** `'Warnungen werden geladen...'`|
|`noWarningText`|The text used when there are no warnings for your region.<br><br>**Default value:** `'Warnungen werden geladen...'`|



Here is an example of an entry in `config.js`
```
{
	module: 'MMM-DWD-WarnWeather',
	position: 'top_left',
	config: {
		region: 'Kreis Lörrach',
		changeColor: true,
		interval: 10 * 60 * 1000, // every 10 minutes
		title: 'Wetterwarnungen',
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
