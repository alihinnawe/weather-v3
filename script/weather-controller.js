import { createSvgLine, createSvgPolygon, createSvgCircle, createSvgText } from "../../../tool/svg.js";
import Controller from "../../../tool/controller.js";

// constants
const OPEN_WEATHER_APP_KEY = "65d8e433543028fb83bd8709bebfad8f";
const OPEN_WEATHER_APP_ORIGIN = "https://api.openweathermap.org";

/**
 * The Weather application controller type.
 */
class WeatherController extends Controller {
	constructor () {
		super();

		// register event listeners
		this.queryButton.addEventListener("click", event => this.processWeatherForecast());
	}

	// get/set accessors
	get locationSection() { return this.center.querySelector("section.location"); }
	get overviewSection() { return this.center.querySelector("section.weather-overview"); }
	get detailsSection() { return this.center.querySelector("section.weather-details"); }
	get locationCityInput() { return this.locationSection.querySelector("input.city"); }
	get locationCountryInput() { return this.locationSection.querySelector("input.country"); }
	get overviewDayTableBody() { return this.overviewSection.querySelector("table>tbody"); }
	get queryButton() { return this.locationSection.querySelector("button.query"); }

	/**
	 * Handles querying a location and the associated weather forecast.
	 */
	async processWeatherForecast () {
		const messageOutput = document.querySelector("footer>input.message");
		messageOutput.classList.remove("success", "failure");

		try {
			const city = this.locationCityInput.value.trim() || null;
			const countryCode = this.locationCountryInput.value.trim() || null;

			const location = await this.#invokeQueryLocation(city, null, countryCode);
			const weatherForecast = await this.#invokeQueryWeatherForecast(location.lat, location.lon);

			if (!this.overviewSection) {
				const overviewSectionTemplate = document.querySelector("head>template.weather-overview");
				this.center.append(overviewSectionTemplate.content.firstElementChild.cloneNode(true));
			}

			const tableRowTemplate = document.querySelector("head>template.weather-overview-row");
			this.overviewDayTableBody.innerHTML = "";

			const dayForecast = { dateText: null, list: [] };
			weatherForecast.list.push(null);		

			for (const threeHourForecast of weatherForecast.list) {
				const dateText = threeHourForecast ? threeHourForecast.dt_txt.substring(0, threeHourForecast.dt_txt.indexOf(' ')) : null;

				if (dayForecast.dateText !== dateText) {
					if (dayForecast.dateText !== null) {
						const tableRow = tableRowTemplate.content.firstElementChild.cloneNode(true);
						this.overviewDayTableBody.append(tableRow);

						const dayThreeHourForecasts = dayForecast.list;
						const date = new Date(dayThreeHourForecasts[0].dt * 1000);
						const minTemperature = this.calculateMinTemperature(dayThreeHourForecasts);
						const maxTemperature = this.calculateMaxTemperature(dayThreeHourForecasts);
						const rain = this.calculateTotalRain(dayThreeHourForecasts);
						const humidity = this.calculateAverageHumidity(dayThreeHourForecasts);
						const pressure = this.calculateAveragePressure(dayThreeHourForecasts);
						const minVisibility = this.calculateMinVisibility(dayThreeHourForecasts);
						const maxVisibility = this.calculateMaxVisibility(dayThreeHourForecasts);

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

			messageOutput.value = "ok";
			messageOutput.classList.add("success");
		} catch (error) {
			messageOutput.value = error.message;
			messageOutput.classList.add("failure");
		}
	}

	calculateMinTemperature(forecasts) {
		return forecasts.reduce((accu, element) => Math.min(accu, element.main.temp_min), Infinity) - 273.15;
	}

	calculateMaxTemperature(forecasts) {
		return forecasts.reduce((accu, element) => Math.max(accu, element.main.temp_max), 0) - 273.15;
	}

	calculateTotalRain(forecasts) {
		return forecasts.reduce((accu, element) => accu + (element.rain ? element.rain["3h"] : 0), 0);
	}

	calculateAverageHumidity(forecasts) {
		return forecasts.reduce((accu, element) => accu + element.main.humidity, 0) / forecasts.length;
	}

	calculateAveragePressure(forecasts) {
		return forecasts.reduce((accu, element) => accu + element.main.pressure, 0) / forecasts.length;
	}

	calculateMinVisibility(forecasts) {
		return forecasts.reduce((accu, element) => Math.min(accu, element.visibility), Infinity);
	}

	calculateMaxVisibility(forecasts) {
		return forecasts.reduce((accu, element) => Math.max(accu, element.visibility), 0);
	}

	/**
	 * Displays a detailed daily weather forecast.
	 * @param city the city
	 * @param date the start timestamp of the day
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async processDayWeatherForecast (city, date, threeHourForecasts) {
		const messageOutput = document.querySelector("footer>input.message");
		messageOutput.classList.remove("success", "failure");

		try {
			this.overviewSection.classList.add("hidden");
			this.locationSection.classList.add("hidden");

			const detailsSectionTemplate = document.querySelector("head>template.weather-details");
			this.center.append(detailsSectionTemplate.content.firstElementChild.cloneNode(true));

			this.detailsSection.querySelector("div.main output.date").value = date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
			this.detailsSection.querySelector("div.main input.city").value = city.name;
			this.detailsSection.querySelector("div.main input.country").value = city.country;
			this.detailsSection.querySelector("div.control>button.back").addEventListener("click", event => this.processBack());
			this.detailsSection.querySelector("div.control>button.toggle.water").addEventListener("click", event => this.detailsSection.querySelector("div.water>table").classList.toggle("hidden"));
			this.detailsSection.querySelector("div.control>button.toggle.pressure").addEventListener("click", event => this.detailsSection.querySelector("div.pressure>table").classList.toggle("hidden"));

			this.displayDayTemperatureForecast(threeHourForecasts);
			this.displayDayWindSpeedForecast(threeHourForecasts);
			this.displayDayWaterForecast(threeHourForecasts);
			this.displayDayPressureForecast(threeHourForecasts);

			messageOutput.value = "ok";
			messageOutput.classList.add("success");
		} catch (error) {
			messageOutput.value = error.message;
			messageOutput.classList.add("failure");
		}
	}

	/**
	 * Removes the details section, and re-displays the location and overview sections.
	 */
	async processBack () {
		const messageOutput = document.querySelector("footer>input.message");
		messageOutput.classList.remove("success", "failure");

		try {
			this.detailsSection.remove();
			this.overviewSection.classList.remove("hidden");
			this.locationSection.classList.remove("hidden");

			messageOutput.value = "ok";
			messageOutput.classList.add("success");
		} catch (error) {
			messageOutput.value = error.message;
			messageOutput.classList.add("failure");
		}
	}

	/**
	 * Displays a detailed daily temperature forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayTemperatureForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.temp>svg");

		const lowerBoundTemperature = Math.floor(this.calculateMinTemperature(threeHourForecasts));
		const upperBoundTemperature = Math.ceil(this.calculateMaxTemperature(threeHourForecasts));
		const degreePixels = 100 / (upperBoundTemperature - lowerBoundTemperature);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let temperature = lowerBoundTemperature; temperature <= upperBoundTemperature; ++temperature) {
			const y = Math.round(120 - (temperature - lowerBoundTemperature) * degreePixels);
			if (temperature !== upperBoundTemperature) coordinatesGroup.append(createSvgLine(15, y, 300, y, { stroke: "lightgray" }));
			coordinatesGroup.append(createSvgText(0, y, `${temperature}°C`));
		}

		const lineGroup = graph.querySelector("g.line");
		let lastX = null, lastY = null;  // Initialize to null to avoid undefined errors
		for (let index = 0; index < threeHourForecasts.length; ++index) {
			const threeHourForecast = threeHourForecasts[index];
			const x = Math.round(index * timePixels);
			const temperature = threeHourForecast.main.temp - 273.15;  // Convert to Celsius
			const y = Math.round(120 - (temperature - lowerBoundTemperature) * degreePixels);

			if (index > 0 && lastX !== null && lastY !== null) {
				lineGroup.append(createSvgLine(lastX, lastY, x, y, { stroke: "blue", "stroke-width": 2 }));
			}

			lastX = x;
			lastY = y;
		}
	}

	/**
	 * Displays a detailed daily wind speed forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayWindSpeedForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.wind>svg");

		const lowerBoundWindSpeed = Math.floor(threeHourForecasts.reduce((accu, element) => Math.min(accu, element.wind.speed), Infinity));
		const upperBoundWindSpeed = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, element.wind.speed), 0));
		const windSpeedPixels = 100 / (upperBoundWindSpeed - lowerBoundWindSpeed);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let windSpeed = lowerBoundWindSpeed; windSpeed <= upperBoundWindSpeed; ++windSpeed) {
			const y = Math.round(120 - (windSpeed - lowerBoundWindSpeed) * windSpeedPixels);
			if (windSpeed !== upperBoundWindSpeed) coordinatesGroup.append(createSvgLine(15, y, 300, y, { stroke: "lightgray" }));
			coordinatesGroup.append(createSvgText(0, y, `${windSpeed} m/s`));
		}

		const lineGroup = graph.querySelector("g.line");
		let lastX = null, lastY = null;
		for (let index = 0; index < threeHourForecasts.length; ++index) {
			const threeHourForecast = threeHourForecasts[index];
			const x = Math.round(index * timePixels);
			const windSpeed = threeHourForecast.wind.speed;
			const y = Math.round(120 - (windSpeed - lowerBoundWindSpeed) * windSpeedPixels);

			if (index > 0 && lastX !== null && lastY !== null) {
				lineGroup.append(createSvgLine(lastX, lastY, x, y, { stroke: "red", "stroke-width": 2 }));
			}

			lastX = x;
			lastY = y;
		}
	}

	/**
	 * Displays a detailed daily water forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayWaterForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.water>svg");

		const lowerBoundWater = Math.floor(threeHourForecasts.reduce((accu, element) => Math.min(accu, (element.rain ? element.rain["3h"] : 0)), Infinity));
		const upperBoundWater = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, (element.rain ? element.rain["3h"] : 0)), 0));
		const waterPixels = 100 / (upperBoundWater - lowerBoundWater);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let water = lowerBoundWater; water <= upperBoundWater; ++water) {
			const y = Math.round(120 - (water - lowerBoundWater) * waterPixels);
			if (water !== upperBoundWater) coordinatesGroup.append(createSvgLine(15, y, 300, y, { stroke: "lightgray" }));
			coordinatesGroup.append(createSvgText(0, y, `${water} l/m²`));
		}

		const lineGroup = graph.querySelector("g.line");
		let lastX = null, lastY = null;
		for (let index = 0; index < threeHourForecasts.length; ++index) {
			const threeHourForecast = threeHourForecasts[index];
			const x = Math.round(index * timePixels);
			const water = threeHourForecast.rain ? threeHourForecast.rain["3h"] : 0;
			const y = Math.round(120 - (water - lowerBoundWater) * waterPixels);

			if (index > 0 && lastX !== null && lastY !== null) {
				lineGroup.append(createSvgLine(lastX, lastY, x, y, { stroke: "blue", "stroke-width": 2 }));
			}

			lastX = x;
			lastY = y;
		}
	}

	/**
	 * Displays a detailed daily pressure forecast.
	 * @param threeHourForecasts the three hour forecasts for one day
	 */
	async displayDayPressureForecast (threeHourForecasts) {
		const graph = this.detailsSection.querySelector("span.pressure>svg");

		const lowerBoundPressure = Math.floor(threeHourForecasts.reduce((accu, element) => Math.min(accu, element.main.pressure), Infinity));
		const upperBoundPressure = Math.ceil(threeHourForecasts.reduce((accu, element) => Math.max(accu, element.main.pressure), 0));
		const pressurePixels = 100 / (upperBoundPressure - lowerBoundPressure);
		const timePixels = 300 / Math.max(1, threeHourForecasts.length - 1);

		const coordinatesGroup = graph.querySelector("g.coordinates");
		for (let pressure = lowerBoundPressure; pressure <= upperBoundPressure; ++pressure) {
			const y = Math.round(120 - (pressure - lowerBoundPressure) * pressurePixels);
			if (pressure !== upperBoundPressure) coordinatesGroup.append(createSvgLine(15, y, 300, y, { stroke: "lightgray" }));
			coordinatesGroup.append(createSvgText(0, y, `${pressure} hPa`));
		}

		const lineGroup = graph.querySelector("g.line");
		let lastX = null, lastY = null;
		for (let index = 0; index < threeHourForecasts.length; ++index) {
			const threeHourForecast = threeHourForecasts[index];
			const x = Math.round(index * timePixels);
			const pressure = threeHourForecast.main.pressure;
			const y = Math.round(120 - (pressure - lowerBoundPressure) * pressurePixels);

			if (index > 0 && lastX !== null && lastY !== null) {
				lineGroup.append(createSvgLine(lastX, lastY, x, y, { stroke: "green", "stroke-width": 2 }));
			}

			lastX = x;
			lastY = y;
		}
	}

	/**
	 * Invokes the weather location query.
	 * @param city the city to query
	 * @param state the state to query
	 * @param countryCode the country code to query
	 */
	async #invokeQueryLocation(city, state = null, countryCode = null) {
		const url = new URL(`${OPEN_WEATHER_APP_ORIGIN}/geo/1.0/direct`);
		url.searchParams.set("q", [city, state, countryCode].filter(Boolean).join(","));
		url.searchParams.set("limit", 1);
		url.searchParams.set("appid", OPEN_WEATHER_APP_KEY);

		const response = await fetch(url);
		if (!response.ok) throw new Error(`Location query failed: ${response.statusText}`);

		const [location] = await response.json();
		if (!location) throw new Error("Location not found");

		return location;
	}

	/**
	 * Invokes the weather forecast query.
	 * @param lat the latitude
	 * @param lon the longitude
	 */
	async #invokeQueryWeatherForecast(lat, lon) {
		const url = new URL(`${OPEN_WEATHER_APP_ORIGIN}/data/2.5/forecast`);
		url.searchParams.set("lat", lat);
		url.searchParams.set("lon", lon);
		url.searchParams.set("appid", OPEN_WEATHER_APP_KEY);
		url.searchParams.set("units", "metric");

		const response = await fetch(url);
		if (!response.ok) throw new Error(`Weather forecast query failed: ${response.statusText}`);

		return response.json();
	}
}

/**
 * Register a listener for the window's "load" event.
 */
window.addEventListener("load", event => {
	const controller = new WeatherController();
	console.log(controller);
});
