from flask import Flask, render_template, request, jsonify
from geopy.geocoders import Nominatim
import requests
import logging
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
TIME_API_KEY = os.getenv("TIME_API_KEY")
IPINFO_API_KEY = os.getenv("IPINFO_API_KEY")

logging.basicConfig(level=logging.DEBUG)
geolocator = Nominatim(user_agent="my-app")

def get_timezone(city):
    location = geolocator.geocode(city)
    latitude = location.latitude
    longitude = location.longitude
    api_url = f"http://api.timezonedb.com/v2.1/get-time-zone?key={TIME_API_KEY}&format=json&by=position&lat={latitude}&lng={longitude}"
    response = requests.get(api_url)
    timezone_data = response.json()
    return timezone_data.get('zoneName', 'Unknown Timezone')

def get_weather_data(city):
    url = f"https://api.tomorrow.io/v4/weather/forecast?location={city}&apikey={WEATHER_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Error fetching weather data: {e}")
        return None

def get_city_from_ip(ip):
    api_url = f"http://ipinfo.io/{ip}/json?token={IPINFO_API_KEY}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        return data.get('city', 'Unknown City')
    except requests.RequestException as e:
        logging.error(f"Error fetching city from IP: {e}")
        return 'Unknown City'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/weather', methods=['POST'])
def weather():
    city = request.form.get('city')
    if not city:
        ip = get_ip()
        if ip == '127.0.0.1':
            city = "Cupertino"
        else:
            city = get_city_from_ip(ip)

    weather_data = get_weather_data(city)
    
    if weather_data is None:
        return jsonify({"error": "Unable to fetch weather data. Please try again."}), 500
    
    if "timelines" not in weather_data or "location" not in weather_data:
        logging.error(f"Unexpected API response: {weather_data}")
        return jsonify({"error": "Invalid data received from weather service."}), 500

    response_data = {
        "timelines": weather_data["timelines"],
        "location": {
            "timezone": get_timezone(city)  
        },
        "city": city
    }

    return jsonify(response_data)

def get_ip():
    return request.remote_addr

if __name__ == '__main__':
    app.run(debug=True)
