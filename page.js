const WCODES = {
  0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",
  45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Dense drizzle",
  61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",
  80:"Rain showers",81:"Rain showers",82:"Violent showers",
  95:"Thunderstorm",96:"Thunderstorm + hail",99:"Thunderstorm + hail"
};
const $ = id => document.getElementById(id);

$('searchForm').addEventListener('submit', async e => {
  e.preventDefault();
  const city = $('cityInput').value.trim();
  if(!city) return;
  $('status').textContent = 'Searching…';
  $('card').classList.remove('show');
  try{
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geo = await geoRes.json();
    if(!geo.results || !geo.results.length){
      $('status').textContent = `No location found for "${city}".`;
      return;
    }
    const place = geo.results[0];
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);
    const w = await wRes.json();
    renderWeather(place, w);
    $('status').textContent = '';
  }catch(err){
    $('status').textContent = 'Something went wrong fetching the forecast. Please try again.';
  }
});

function renderWeather(place, w){
  const c = w.current;
  $('loc').textContent = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  $('temp').textContent = Math.round(c.temperature_2m) + '°C';
  $('desc').textContent = WCODES[c.weather_code] || 'Unknown';
  $('feels').textContent = Math.round(c.apparent_temperature) + '°C';
  $('hum').textContent = c.relative_humidity_2m + '%';
  $('wind').textContent = Math.round(c.wind_speed_10m) + ' km/h';

  const days = w.daily.time.map((date,i)=>{
    const d = new Date(date);
    const label = i===0 ? 'Today' : d.toLocaleDateString(undefined,{weekday:'short'});
    return `<div class="day"><div class="d">${label}</div><div class="t">${Math.round(w.daily.temperature_2m_max[i])}° / ${Math.round(w.daily.temperature_2m_min[i])}°</div></div>`;
  }).join('');
  $('days').innerHTML = days;
  $('card').classList.add('show');
}

window.addEventListener('DOMContentLoaded', () => {
  $('cityInput').value = 'Pune';
  $('searchForm').dispatchEvent(new Event('submit'));
});