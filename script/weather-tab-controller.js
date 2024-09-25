import { createSvgLine, createSvgPolygon, createSvgCircle, createSvgText } from "../../../tool/svg.js";
import TabController from "../../../tool/tab-controller.js";


/**
 * The weather application tab controller type.
 */
class WeatherTabController extends TabController {
	static #OPEN_WEATHER_APP_KEY = "yours";
	static #OPEN_WEATHER_APP_ORIGIN = "https://api.openweathermap.org";


	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super("weather");

		// register controller event listeners
		this.addEventListener("activated", event => this.processActivated());
	}


	// define getter/setter
	get locationSection () { return this.center.querySelector("section.weather-location"); }
	get overviewSection () { return this.center.querySelector("section.weather-overview"); }
	get detailsSection () { return this.center.querySelector("section.weather-details"); }
	get locationQueryButton () { return this.locationSection.querySelector("button.query"); }
	get locationCityInput () { return this.locationSection.querySelector("input.city"); }
	get locationCountryInput () { return this.locationSection.querySelector("input.country"); }
	get overviewTableBody () { return this.overviewSection.querySelector("table>tbody"); }
	get detailsDateOutput () { return this.detailsSection.querySelector("div.main output.date"); }
	get detailsCityOutput () { return this.detailsSection.querySelector("div.main input.city"); }
	get detailsCountryOutput () { return this.detailsSection.querySelector("div.main input.country"); }
	get detailsBackButton () { return this.detailsSection.querySelector("div.control>button.back"); }
	get detailsToggleWaterButton () { return this.detailsSection.querySelector("div.control>button.toggle.water"); }
	get detailsTogglePressureButton () { return this.detailsSection.querySelector("div.control>button.toggle.pressure"); }

	get detailsWaterTable () { return this.detailsSection.querySelector("div.water>table"); }
	get detailsWaterTableBody () { return this.detailsWaterTable.querySelector("tbody"); }
	get detailsPressureTable () { return this.detailsSection.querySelector("div.pressure>table"); }
	get detailsPressureTableBody () { return this.detailsPressureTable.querySelector("tbody"); }

	get temperatureGraph () { return this.detailsSection.querySelector("span.temp>svg"); }
	get temperatureGraphCoordinatesGroup () { return this.temperatureGraph.querySelector("g.coordinates"); }
	get temperatureGraphTempRangeGroup () { return this.temperatureGraph.querySelector("g.temp-range"); }
	get temperatureGraphTempGroup () { return this.temperatureGraph.querySelector("g.temp"); }
	get windGraph () { return this.detailsSection.querySelector("span.wind>svg"); }
	get windGraphCoordinatesGroup () { return this.windGraph.querySelector("g.coordinates"); }
	get windGraphGustRangeGroup () { return this.windGraph.querySelector("g.gust-range"); }
	get windGraphSpeedGroup () { return this.windGraph.querySelector("g.wind"); }


	/**
	 * Handles activating this tab controller.
	 */
	async processActivated () {
		// Remove content of center article
		this.center.innerHTML = "";
		this.messageOutput.value = "";

		// insert primary tab section into center article
		const locationSectionTemplate = document.querySelector("head>template.weather-location");
		this.center.append(locationSectionTemplate.content.firstElementChild.cloneNode(true));

		// register event listeners
		this.locationQueryButton.addEventListener("click", event => this.processWeatherForecast());
	}


	/**
	 * Handles querying a location and the associated weather forecast.
	 */
	async processWeatherForecast () {
		this.messageOutput.classList.remove("success", "failure");
		try {
			const city = this.locationCityInput.value.trim() || null;
			const countryCode = this.locationCountryInput.value.trim() || null;

			const location = await this.#invokeQueryLocation(city, null, countryCode);
			// console.log(location);

			const weatherForecast = await this.#invokeQueryWeatherForecast(location.lat, location.lon);
			// console.log(weatherForecast);

			if (!this.overviewSection) {
				const overviewSectionTemplate = document.querySelector("head>template.weather-overview");
				this.center.append(overviewSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const tableRowTemplate = document.querySelector("head>template.weather-overview-row");
			this.overviewTableBody.innerHTML = "";

			// collects daily forecast data, and adds a new table row whenever the
			// day changes; aggregates the row data from the available 3-hour forecasts;
			// adds a null element as signal element
			const dayForecast = { dateText: null, list: [] };
			weatherForecast.list.push(null);		

			for (const threeHourForecast of weatherForecast.list) {
				const dateText = threeHourForecast
					? threeHourForecast.dt_txt.substring(0, threeHourForecast.dt_txt.indexOf(' '))
					: null;
				// console.log(dateText);

				if (dayForecast.dateText !== dateText) {
					if (dayForecast.dateText !== null) {
						const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
						this.overviewTableBody.append(tableRow);

						const dayThreeHourForecasts = dayForecast.list;
						const date = new Date(dayThreeHourForecasts[0].dt * 1000);
						const minTemperature = dayThreeHourForecasts.reduce((accu, element) => Math.min(accu, element.main.temp_min), Infinity) - 273.15;
						const maxTemperature = dayThreeHourForecasts.reduce((accu, element) => Math.max(accu, element.main.temp_max), 0) - 273.15;
						const rain = dayThreeHourForecasts.reduce((accu, element) => accu + (element.rain ? element.rain["3h"] : 0), 0);
						const humidity = dayThreeHourForecasts.reduce((accu, element) => accu + element.main.humidity, 0) / dayThreeHourForecasts.length;
						const pressure = dayThreeHourForecasts.reduce((accu, element) => accu + element.main.pressure, 0) / dayThreeHourForecasts.length;
						const minVisibility = dayThreeHourForecasts.reduce((accu, element) => Math.min(accu, element.visibility), Infinity);
						const maxVisibility = dayThreeHourForecasts.reduce((accu, element) => Math.max(accu, element.visibility), 0);

						const dateButton = tableRow.querySelector("td.date>button");
						dateButton.innerText = date.toLocaleDateString();
						dateButton.addEventListener("click", event => this.processDayWeatherForecast(weatherForecast.city, date, dayThreeHourForecasts));
						tableRow.querySelector("td.temperature").innerText = Math.round(minTemperature) + "°C - " + Math.round(maxTemperature) + "°C";
						tableRow.querySelector("td.rain").innerText = Math.round(rain) + " l/m²";
						tableRow.querySelector("td.humidity").innerText = Math.round(humidity) + "%";
						tableRow.querySelector("td.pressure").innerText = Math.round(pressure) + " hPa";
						tableRow.querySelector("td.visibility").innerText = Math.round(minVisibility) + " - " + Math.round(maxVisibility);
					}

					dayForecast.dateText = dateText;
					dayForecast.list = [];
				}

				dayForecast.list.push(threeHourForecast);
			}

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Displays a detailed daily weather forecast.
	 * @param city the city
	 * @param date the start timestamp of the day
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async processDayWeatherForecast (city, date, threeHourForecasts) {
		this.messageOutput.classList.remove("success", "failure");
		try {
			this.locationSection.classList.add("hidden");
			this.overviewSection.classList.add("hidden");

			const detailsSectionTemplate = document.querySelector("head>template.weather-details");
			this.center.append(detailsSectionTemplate.content.firstElementChild.cloneNode(true));

			this.detailsDateOutput.value = date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
			this.detailsCityOutput.value = city.name;
			this.detailsCountryOutput.value = city.country;
			this.detailsBackButton.addEventListener("click", event => this.processBack());
			this.detailsToggleWaterButton.addEventListener("click", event => this.detailsWaterTable.classList.toggle("hidden"));
			this.detailsTogglePressureButton.addEventListener("click", event => this.detailsPressureTable.classList.toggle("hidden"));

			this.#displayDayTemperatureForecast(threeHourForecasts);
			this.#displayDayWindSpeedForecast(threeHourForecasts);
			this.#displayDayWaterForecast(threeHourForecasts);
			this.#displayDayPressureForecast(threeHourForecasts);

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Removes the details section, and re-displays the location and overview sections.
	 */
	async processBack () {
		this.messageOutput.classList.remove("success", "failure");
		try {
			this.detailsSection.remove();
			this.overviewSection.classList.remove("hidden");
			this.locationSection.classList.remove("hidden");

			this.messageOutput.value = "ok";
			this.messageOutput.classList.add("success");
		} catch (error) {
			this.messageOutput.value = error.message;
			this.messageOutput.classList.add("failure");
		}
	}


	/**
	 * Displays a detailed daily temperature forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async #displayDayTemperatureForecast (threeHourForecasts) {
		const lowerBoundTemperature = Math.floor(threeHourForecasts.reduce((accu, element) => Math.min(accu, element.main.temp_min), Infinity) - 273.15);
		const upperBoundTemperature = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, element.main.temp_max), 0) - 273.15);
		const degreePixels = 100 / (upperBoundTemperature - lowerBoundTemperature);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		for (let temperature = lowerBoundTemperature; temperature <= upperBoundTemperature; ++temperature) {
			const y = Math.round(120 - (temperature - lowerBoundTemperature) * degreePixels);
			if (temperature != upperBoundTemperature) this.temperatureGraphCoordinatesGroup.append(createSvgLine(15, y, 20, y));
			if (temperature % 2 === 0) this.temperatureGraphCoordinatesGroup.append(createSvgText(5, y + 3, 0, temperature));
		}

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			const x = Math.round(20 + timeSlot * timePixels);
			const timeText = threeHourForecasts[timeSlot].dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			if (timeSlot === 0 || timeSlot !== threeHourForecasts.length - 1) this.temperatureGraphCoordinatesGroup.append(createSvgLine(x, 125, x, 120));
			this.temperatureGraphCoordinatesGroup.append(createSvgText(x - 10, 135, 0, timeText));
		}

		const temperatureCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			temperatureCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp - 273.15 - lowerBoundTemperature) * degreePixels));
		}

		const temperatureRangeCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			temperatureRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureRangeCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp_max - 273.15 - lowerBoundTemperature) * degreePixels));
		}
		for (let timeSlot = threeHourForecasts.length - 1; timeSlot >= 0; --timeSlot) {
			temperatureRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			temperatureRangeCoordinates.push(Math.round(120 - (threeHourForecasts[timeSlot].main.temp_min - 273.15 - lowerBoundTemperature) * degreePixels));
		}

		this.temperatureGraphTempRangeGroup.append(createSvgPolygon(...temperatureRangeCoordinates));
		for (let index = 2; index < temperatureCoordinates.length; index += 2)
			this.temperatureGraphTempGroup.append(createSvgLine(temperatureCoordinates[index - 2], temperatureCoordinates[index - 1], temperatureCoordinates[index], temperatureCoordinates[index + 1]));
		for (let index = 0; index < temperatureCoordinates.length; index += 2)
			this.temperatureGraphTempGroup.append(createSvgCircle(temperatureCoordinates[index], temperatureCoordinates[index + 1], 2));
	}


	/**
	 * Displays a detailed daily wind speed forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async #displayDayWindSpeedForecast (threeHourForecasts) {
		const upperBoundWindSpeed = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, element.wind.gust), 0) * 3.6);
		const degreePixels = 100 / upperBoundWindSpeed;
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		for (let windSpeed = 0; windSpeed <= upperBoundWindSpeed; windSpeed += 10) {
			const y = Math.round(120 - windSpeed * degreePixels);
			if (windSpeed != upperBoundWindSpeed) this.windGraphCoordinatesGroup.append(createSvgLine(15, y, 20, y));
			this.windGraphCoordinatesGroup.append(createSvgText(5, y + 3, 0, windSpeed));
		}

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			const x = Math.round(20 + timeSlot * timePixels);
			const timeText = threeHourForecasts[timeSlot].dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			if (timeSlot === 0 || timeSlot !== threeHourForecasts.length - 1) this.windGraphCoordinatesGroup.append(createSvgLine(x, 125, x, 120));
			this.windGraphCoordinatesGroup.append(createSvgText(x - 10, 135, 0, timeText));
		}

		const windSpeedCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			windSpeedCoordinates.push(Math.round(20 + timeSlot * timePixels));
			windSpeedCoordinates.push(Math.round(120 - threeHourForecasts[timeSlot].wind.speed * 3.6 * degreePixels));
		}

		const gustSpeedRangeCoordinates = [];
		for (let timeSlot = 0; timeSlot < threeHourForecasts.length; ++timeSlot) {
			gustSpeedRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			gustSpeedRangeCoordinates.push(Math.round(120 - Math.max(threeHourForecasts[timeSlot].wind.speed, threeHourForecasts[timeSlot].wind.gust) * 3.6 * degreePixels));
		}
		for (let timeSlot = threeHourForecasts.length - 1; timeSlot >= 0; --timeSlot) {
			gustSpeedRangeCoordinates.push(Math.round(20 + timeSlot * timePixels));
			gustSpeedRangeCoordinates.push(Math.round(120 - Math.min(threeHourForecasts[timeSlot].wind.speed, threeHourForecasts[timeSlot].wind.gust) * 3.6 * degreePixels));
		}

		this.windGraphGustRangeGroup.append(createSvgPolygon(...gustSpeedRangeCoordinates));
		for (let index = 2; index < windSpeedCoordinates.length; index += 2)
			this.windGraphSpeedGroup.append(createSvgLine(windSpeedCoordinates[index - 2], windSpeedCoordinates[index - 1], windSpeedCoordinates[index], windSpeedCoordinates[index + 1]));
		for (let index = 0; index < windSpeedCoordinates.length; index += 2)
			this.windGraphSpeedGroup.append(createSvgCircle(windSpeedCoordinates[index], windSpeedCoordinates[index + 1], 2));
	}


	/**
	 * Displays a detailed daily water related forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async #displayDayWaterForecast (threeHourForecasts) {
		const tableRowTemplate = document.querySelector("head>template.weather-details-water-row");
		this.detailsWaterTableBody.innerHTML = "";

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (const threeHourForecast of threeHourForecasts) {
			const timeText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);

			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			this.detailsWaterTableBody.append(tableRow);

			tableRow.querySelector("td.time").innerText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			tableRow.querySelector("td.rain").innerText = (threeHourForecast.rain ? threeHourForecast.rain["3h"] : 0).toString();
			tableRow.querySelector("td.humidity").innerText = threeHourForecast.main.humidity + "%";
			tableRow.querySelector("td.cloudiness").innerText = threeHourForecast.clouds.all + "%";
			tableRow.querySelector("td.visibility").innerText = threeHourForecast.visibility.toString();
		}
	}


	/**
	 * Displays a detailed daily pressure related forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async #displayDayPressureForecast (threeHourForecasts) {
		const tableRowTemplate = document.querySelector("head>template.weather-details-pressure-row");
		this.detailsPressureTableBody.innerHTML = "";

		const delimiterPosition = threeHourForecasts[0].dt_txt.indexOf(" ");
		for (const threeHourForecast of threeHourForecasts) {
			const timeText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);

			const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
			this.detailsPressureTableBody.append(tableRow);

			tableRow.querySelector("td.time").innerText = threeHourForecast.dt_txt.substring(delimiterPosition + 1, delimiterPosition + 6);
			tableRow.querySelector("td.pressure.main").innerText = threeHourForecast.main.pressure + " hPa";
			tableRow.querySelector("td.pressure.sea").innerText = threeHourForecast.main.sea_level + " hPa";
			tableRow.querySelector("td.pressure.ground").innerText = threeHourForecast.main.grnd_level + " hPa";
		}
	}


	/**
	 * Invokes the location query web-service operation.
	 * @param city the city
	 * @param stateCode the state code
	 * @param countryCode the country code
	 * @return the (optional) location, or null for none
	 */
	async #invokeQueryLocation (city, stateCode, countryCode) {
		const queryFactory = new URLSearchParams();
		queryFactory.set("appid", this.constructor.#OPEN_WEATHER_APP_KEY);
		queryFactory.set("limit", 1);
		queryFactory.set("q", (city || "") + "," + (stateCode || "") + "," + (countryCode || ""));

		const resource = this.constructor.#OPEN_WEATHER_APP_ORIGIN + "/geo/1.0/direct?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await fetch(resource, { method: "GET", headers: headers, credentials: "omit" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		const locations = await response.json();

		return locations.length === 0 ? null : locations[0];
	}


	/**
	 * Invokes the 5-day weather forecast query web-service operation.
	 * @param latitude the latitude within range [-90°, +90°]
	 * @param longitude the longitude within range ]-180°, +180°]
	 * @return the 5-day weather forecast
	 */
	async #invokeQueryWeatherForecast (latitude, longitude) {
		const queryFactory = new URLSearchParams();
		queryFactory.set("appid", this.constructor.#OPEN_WEATHER_APP_KEY);
		queryFactory.set("lat", latitude);
		queryFactory.set("lon", longitude);

		const resource = this.constructor.#OPEN_WEATHER_APP_ORIGIN + "/data/2.5/forecast?" + queryFactory.toString();
		const headers = { "Accept": "application/json" };
		const response = await fetch(resource, { method: "GET", headers: headers, credentials: "omit" });
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		return response.json();
	}
}



/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", event => {
	const controller = new WeatherTabController();
	console.log(controller);

	// activate initial tab
	controller.tabControl.click();
});
