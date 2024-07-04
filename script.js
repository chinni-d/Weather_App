document.getElementById("city").addEventListener("input", function () {
  var city = this.value;
  getWeather(city);
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Debugging line
        getWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        getWeather("Delhi"); // Default to Delhi on error
      }
    );
  } else {
    alert("Geolocation is not supported by this browser. Defaulting to Delhi.");
    getWeather("Delhi");
  }
}

document.addEventListener("DOMContentLoaded", getLocation);

async function getWeather(location) {
  try {
    const params = {
      q: location,
      appid: "3e59a8b2bc0b6177832c82258e3e9771",
      units: "metric",
    };

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      { params }
    );

    displayWeather(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
}

async function getWeatherByCoordinates(latitude, longitude) {
  try {
    const params = {
      lat: latitude,
      lon: longitude,
      appid: "3e59a8b2bc0b6177832c82258e3e9771",
      units: "metric",
    };

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      { params }
    );

    displayWeather(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
}

function displayWeather(data) {
  const currentTemperature = data.list[0].main.temp;
  document.querySelector(".weather-temp").textContent =
    Math.round(currentTemperature) + "ºC";

  const forecastData = data.list;
  const dailyForecast = {};

  forecastData.forEach((data) => {
    const day = new Date(data.dt * 1000).toLocaleDateString("en-US", {
      weekday: "long",
    });
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        minTemp: data.main.temp_min,
        maxTemp: data.main.temp_max,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      };
    } else {
      dailyForecast[day].minTemp = Math.min(
        dailyForecast[day].minTemp,
        data.main.temp_min
      );
      dailyForecast[day].maxTemp = Math.max(
        dailyForecast[day].maxTemp,
        data.main.temp_max
      );
    }
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayForecast = dailyForecast[today];

  document.querySelector(".date-dayname").textContent = today;
  document.querySelector(".date-day").textContent = new Date()
    .toUTCString()
    .slice(5, 16);
  document.querySelector(".weather-icon").innerHTML = getWeatherIcon(
    todayForecast.icon
  );
  document.querySelector(".location").textContent = data.city.name;
  document.querySelector(".weather-desc").textContent =
    todayForecast.description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  document.querySelector(".humidity .value").textContent =
    todayForecast.humidity + " %";
  document.querySelector(".wind .value").textContent =
    todayForecast.windSpeed + " m/s";

  const dayElements = document.querySelectorAll(".day-name");
  const tempElements = document.querySelectorAll(".day-temp");
  const iconElements = document.querySelectorAll(".day-icon");

  dayElements.forEach((dayElement, index) => {
    const day = Object.keys(dailyForecast)[index];
    const data = dailyForecast[day];
    dayElement.textContent = day;
    tempElements[index].textContent = `${Math.round(
      data.minTemp
    )}º / ${Math.round(data.maxTemp)}º`;
    iconElements[index].innerHTML = getWeatherIcon(data.icon);
  });
}

function getWeatherIcon(iconCode) {
  const iconBaseUrl = "https://openweathermap.org/img/wn/";
  const iconSize = "@2x.png";
  return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

document.addEventListener("DOMContentLoaded", function () {
  getLocation();
  setInterval(getLocation, 900000);
});
