var searchHistory = [];
const localSearchHistory = "searchHistory";
var searchCity;
var key = "2380de71f9e430a41b68a2a251610a75";
var pageLoading = false;

$(document).ready(function () {
  $("#currentDate").text(moment().format("dddd, MMMM Do YYYY"));
  var history = getSearchHistory();
  if (history && history.length > 0) {
    pageLoading = true;
    //get most recent search
    searchCity = history.pop();
    getWeather();
    pageLoading = false;
  } else {
    $("#fiveDay").hide();
  }

  $(".searchBtn").click(function () {
    searchCity = $(".searchInput").val().trim();
    getWeather();
  });
});

function getWeather() {
  fetchWeatherData();
  appendSearchHistory();
  storeSearchHistory();
}

function fetch5DayForecast(lat, lon) {
  fetch(
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&exclude=current,minutely,hourly,alerts&units=imperial&cnt=5&appid=" +
      key
  )
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      set5DayInfo(data.daily);
    });
}

function fetchWeatherData() {
  fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=" +
      searchCity +
      "&units=imperial&appid=" +
      key
  )
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      setCurrentInfo(data);
    });
}

function fetchUVIndex(lat, lon) {
  fetch(
    "http://api.openweathermap.org/data/2.5/uvi?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      key
  )
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      var uvIndex = parseInt(data.value);
      var severityColor;
      if (uvIndex <= 2) {
        severityColor = "green";
      } else if (uvIndex <= 5) {
        severityColor = "yellow";
      } else if (uvIndex <= 7) {
        severityColor = "orange";
      } else if (uvIndex <= 10) {
        severityColor = "red";
      } else {
        severityColor = "purple";
      }
      var colorSpan = $("<span/>");
      colorSpan.css("color", severityColor);
      colorSpan.text("UV Index:" + data.value);
      $("#currentInfo").append(colorSpan);
    });
}

function set5DayInfo(daily) {
  var fiveDays = daily.slice(0, 5);
  fiveDays.forEach(function (item, index) {
    var dayDiv = $("#" + index);
    dayDiv
      .find(".info")
      .text(moment.unix(item.dt).format("dddd, MMMM Do YYYY"))
      .append("<br>")
      .append(item.temp.day)
      .append("&#8457;")
      .append("<br>")
      .append("Humidity: " + item.humidity + "%");

    dayDiv
      .find(".weatherIcon")
      .attr(
        "src",
        `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
      );
  });
}

function setCurrentInfo(currentWeatherData) {
  $("#fiveDay").show();
  $(".cityName").text(currentWeatherData.name);
  $(".weatherIcon").attr(
    "src",
    `http://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`
  );
  $("#currentInfo")
    .text(currentWeatherData.main.temp)
    .append("&#8457;")
    .append("<br>")
    .append("Humidity:" + currentWeatherData.main.humidity)
    .append("<br>")
    .append("Windspeed:" + currentWeatherData.wind.speed)
    .append("<br>");
  var lat = currentWeatherData.coord.lat;
  var lon = currentWeatherData.coord.lon;
  fetchUVIndex(lat, lon);
  fetch5DayForecast(lat, lon);
}

function getWeatherForCity() {}

function storeSearchHistory() {
  searchHistory.push(searchCity);
  localStorage.setItem(localSearchHistory, JSON.stringify(searchHistory));
  console.log(searchCity + " was saved to local storage.");
}
function appendSearchHistory() {
  var history = getSearchHistory();
  if (pageLoading) {
    history.forEach(function (item) {
      var button = $("<button/>");
      button.attr("class", "btn btn-info history");
      button.attr("type", "button");
      button.text(" " + item);
      $(".historyItems").append(button);
      $(".history").click(function () {
        searchCity = $(this).text().trim();
        $(".searchInput").val(null);
      });
    });
  } else if (!history || !history.includes(searchCity)) {
    var button = $("<button/>");
    button.attr("class", "btn btn-info history");
    button.attr("type", "button");
    button.text(" " + searchCity);
    $(".historyItems").append(button);
    $(".history").click(function () {
      searchCity = $(this).text().trim();
      $(".searchInput").val(null);
      getWeather();
    });
  }
}

function getSearchHistory() {
  return JSON.parse(localStorage.getItem(localSearchHistory));
}
