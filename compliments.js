/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("compliments", { 

	// Module config defaults.
	defaults: {
		compliments: {
			anytime: [
				/*"Hey there sexy!"*/
				"\“Do not pray for an easy life, pray for the strength to endure a difficult one.\” - Bruce Lee",
				"\“I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.\” - Bruce Lee",
				"\“I’m not in this world to live up to your expectations and you’re not in this world to live up to mine.\” - Bruce Lee",
				"\“Knowing is not enough, we must apply. Willing is not enough, we must do.\” - Bruce Lee",
				"\“Do or do not. There is no try\” - Master Yoda",
				"\“I have a dream.\” - Martin Luther King Jr.",
				"\“I have a nightmare.\” - Soorya S.",
				"\“Facts don’t care about your feelings\” - Ben Shapiro ",
				"\“I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.\”  ― Marilyn Monroe",
				"\“Be yourself; everyone else is already taken.\”  ― Oscar Wilde",
				"\“I don’t need an Iron Man suit. I’m already a weapon of mass seduction.\” – Robert Downey Jr.",
				"\“Listen, smile, agree, and then do whatever the f*&k you were gonna do anyway.\” – Robert Downey Jr.",
				"\“You’ve got enemies? Good, that means you actually stood up for something.\” – Marshall Mathers",
				"\“It’s beauty in the struggle, ugliness in the success.\” – J.Cole",
				"\“I’d like to take this chance to apologize to absolutely nobody.\” - Conor McGregor",
				"\“A word after a word after a word is power.\” - Margaret Atwood",
				"\“There is no charm equal to tenderness of heart.\” - Jane Austen",
				"\“It is far better to be alone, than to be in bad company.\” - George Washington",
				"\“Happiness can exist only in acceptance.\” - George Orwell",
				"\“I took a deep breath and listened to the old brag of my heart. I am. I am. I am.\” - Sylvia Plath",
				"\“Tomorrow is always fresh, with no mistakes in it yet.\” - L.M. Montgomery",
				"\“It's much better to do good in a way that no one knows anything about it.\” - Leo Tolstoy",
				"\“Real courage is when you know you’re licked before you begin, but you begin anyway and see it through no matter what.\” - Harper Lee"

			],

			/*
			morning: [
				"Good morning, handsome!",
				"Enjoy your day!",
				"How was your sleep?"
			],
			afternoon: [
				"Hello, beauty!",
				"You look sexy!",
				"Looking good today!"
			],
			evening: [
				"Wow, you look hot!",
				"You look nice!",
				"Hi, sexy!"
			]
			*/
		},
		updateInterval: 30000,
		remoteFile: null,
		fadeSpeed: 4000,
		morningStartTime: 3,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17
	},

	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		var self = this;
		if (this.config.remoteFile != null) {
			this.complimentFile(function(response) {
				self.config.compliments = JSON.parse(response);
				self.updateDom();
			});
		}

		// Schedule update timer.
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function() {
		var hour = moment().hour();
		var compliments;

		if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		compliments.push.apply(compliments, this.config.compliments.anytime);

		return compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function() {
		var compliments = this.complimentArray();
		var index = this.randomIndex(compliments);

		return compliments[index];
	},

	// Override dom generator.
	getDom: function() {
		var complimentText = this.randomCompliment();

		var compliment = document.createTextNode(complimentText);
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";
		wrapper.appendChild(compliment);

		return wrapper;
	},


	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},


	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification == "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
	},

});
