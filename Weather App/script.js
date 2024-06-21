const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchform]");
const grantAcessContainer = document.querySelector(".grant-container");
const userInfoContainer = document.querySelector(".info-container");

const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');


//initially variables
let currentTab = userTab;
const API_KEY = "168771779c71f3d64106d8a88376808a";
currentTab.classList.add("current-tab");
getFromSessionStroage();


function switchTab(clickedTab) {
    notFound.classList.remove("active");
    //check if clicktab is already selected or not
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // Check which TAb is Selected - search / your

        if (!searchForm.classList.contains("active")) {
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove('active');

        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStroage();
        }

    }
}


userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getFromSessionStroage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    // Local Coordinates Not present - Grant Access Container

    if (!localCoordinates) {
        grantAcessContainer.classList.add('active');
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

const loadingScreen = document.querySelector(".loading-container");
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    //make grant container invisile
    grantAcessContainer.classList.remove("active");
    //add loder visible
    loadingScreen.classList.add("active");


    //API call

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (!data.sys) {
            throw data;
        }

        loadingScreen.classList.remove("active");

        userInfoContainer.classList.add("active");

        //find the value of data and render on Ui
        renderWeatherInfo(data);


    }
    catch (err) {

        loadingScreen.remove("active");
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchUserWeatherInfo);

    }

}

function renderWeatherInfo(Weatherinfo) {
    //firstly we have to fetch the elements

    const CityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");

    //fetch values from weatherInfo obejct and put it UI elements

    CityName.innerText = Weatherinfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${Weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = Weatherinfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${Weatherinfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${Weatherinfo?.main?.temp.toFixed(2)} °C`;
    windSpeed.innerText = `${Weatherinfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${Weatherinfo?.main?.humidity.toFixed(2)} %`;
    cloud.innerText = `${Weatherinfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessButton = document.querySelector('[data-grantAcess]');

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessButton.style.display = 'none';
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', getLocation);


// Search for weather
const searchInput = document.querySelector("[data-searchInput ]");

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if (cityName === " ") {
        return;
    }
    fetchSearchWeatherInfo(cityName);
    searchInput.value = "";
})


async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");
    notFound.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}