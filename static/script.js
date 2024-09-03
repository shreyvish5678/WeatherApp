document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const weatherInfo = document.getElementById('weather-info');
    const infoButton = document.getElementById('info-button');
    const locationButton = document.getElementById('get-location-weather');

    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = document.getElementById('city').value;

        try {
            const response = await fetch('/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `city=${encodeURIComponent(city)}`,
            });

            const data = await response.json();

            if (response.ok) {
                displayWeather(data, city);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            weatherInfo.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });

    locationButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: '',
            });

            const data = await response.json();

            if (response.ok) {
                displayWeather(data, data.location.city);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            weatherInfo.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });

    infoButton.addEventListener('click', () => {
        alert('PM Accelerator: From entry-level to VP of Product, we support PM professionals through every stage of their career. Name: Shrey Vishen');
    });

    function displayWeather(data, city) {
        if (!data.timelines || !data.timelines.minutely || data.timelines.minutely.length === 0) {
            weatherInfo.innerHTML = '<p>Error: No weather data available for this location.</p>';
            return;
        }

        const currentWeather = data.timelines.minutely[0].values;
        const forecast = data.timelines.hourly.slice(1, 6);
        const timezone = data.location.timezone;
        const actual_city = data.city;

        const currentTime = new Date(data.timelines.minutely[0].time).toLocaleString('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        let html = `
            <h2>Current Weather in ${actual_city}: ${currentTime}</h2>
            <div class="weather-card">
                <img src="${getWeatherIcon(currentWeather.weatherCode)}" alt="Weather Icon" class="weather-icon">
                <p>Temperature: ${currentWeather.temperature.toFixed(1)}°C</p>
                <p>Humidity: ${currentWeather.humidity.toFixed(0)}%</p>
                <p>Wind Speed: ${currentWeather.windSpeed.toFixed(1)} m/s</p>
                <p>Weather: ${getWeatherDescription(currentWeather.weatherCode)}</p>
            </div>
            <h3>Hourly Forecast</h3>
        `;

        forecast.forEach((minute, index) => {
            const localTime = new Date(minute.time).toLocaleString('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            html += `
                <div class="weather-card">
                    <h4>${localTime}</h4>
                    <img src="${getWeatherIcon(minute.values.weatherCode)}" alt="Weather Icon" class="weather-icon">
                    <p>Temperature: ${minute.values.temperature.toFixed(1)}°C</p>
                    <p>Weather: ${getWeatherDescription(minute.values.weatherCode)}</p>
                </div>
            `;
        });

        html += `
            <button id="back-button" class="back-button">Back</button>
        `;

        weatherInfo.innerHTML = html;

        document.getElementById('back-button').addEventListener('click', () => {
            weatherInfo.innerHTML = '';
            weatherForm.style.display = 'block';
        });

        weatherForm.style.display = 'none';
    }
});

function getWeatherIcon(weatherCode) {
    const iconMap = {
        1000: 'static/animated/day.svg',
        1100: 'static/animated/cloudy-day-1.svg',
        1101: 'static/animated/cloudy-day-2.svg',
        1102: 'static/animated/cloudy-day-3.svg',
        1001: 'static/animated/cloudy.svg',
        4000: 'static/animated/rainy-1.svg',
        4001: 'static/animated/rainy-2.svg',
        4200: 'static/animated/rainy-3.svg',
        5000: 'static/animated/snowy-1.svg',
        5001: 'static/animated/snowy-2.svg',
        5100: 'static/animated/snowy-3.svg',
        5101: 'static/animated/snowy-6.svg',
        6000: 'static/animated/rainy-4.svg',
        6200: 'static/animated/rainy-5.svg',
        7000: 'static/animated/snowy-4.svg',
        7101: 'static/animated/snowy-5.svg',
        7102: 'static/animated/snowy-4.svg',
        8000: 'static/animated/thunder.svg'
    };

    return iconMap[weatherCode] || 'https://raw.githubusercontent.com/tomorrow-io-api/tomorrow-weather-codes/master/V2/svg/unknown.svg';
}

function getWeatherDescription(weatherCode) {
    const descriptions = {
        1000: 'Clear',
        1100: 'Mostly Clear',
        1101: 'Partly Cloudy',
        1102: 'Mostly Cloudy',
        1001: 'Cloudy',
        4000: 'Rain',
        4001: 'Light Rain',
        4200: 'Heavy Rain',
        5000: 'Snow',
        5001: 'Flurries',
        5100: 'Light Snow',
        5101: 'Heavy Snow',
        6000: 'Freezing Drizzle',
        6200: 'Freezing Rain',
        7000: 'Ice Pellets',
        7101: 'Heavy Ice Pellets',
        7102: 'Light Ice Pellets',
        8000: 'Thunderstorm'
    };

    return descriptions[weatherCode] || 'Unknown';
}
