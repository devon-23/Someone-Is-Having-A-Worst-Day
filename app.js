// ═══════════════════════════════════════════════════════════════════
//  WORST DAY DASHBOARD
// ═══════════════════════════════════════════════════════════════════

const K    = (typeof KEYS !== 'undefined') ? KEYS : {};
const DEMO = !K.OPENWEATHER || K.OPENWEATHER === 'YOUR_OPENWEATHER_API_KEY';

let currentCity = '';

// ── Helpers ───────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

function setCity(name) {
  document.getElementById('cityInput').value = name;
  fetchAllData();
}

function setStatus(text, live = false) {
  document.getElementById('statusText').textContent = text;
  document.getElementById('statusDot').className = 'status-dot' + (live ? ' live' : '');
}

function showLoading(msg = 'SCANNING FOR MISERY…') {
  document.getElementById('loadingOverlay').classList.add('visible');
  document.getElementById('loadingText').textContent = msg;
  document.getElementById('heroCard').classList.remove('visible');
  document.getElementById('dataGrid').innerHTML = '';
  document.getElementById('tickerWrap').style.display = 'none';
  document.getElementById('errorMsg').classList.remove('visible');
  document.getElementById('resultsHeading').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('visible');
}

function showError(msg) {
  hideLoading();
  const el = document.getElementById('errorMsg');
  el.textContent = '⚠ ' + msg;
  el.classList.add('visible');
  setStatus('ERROR');
}

// ════════════════════════════════════════════════════════════════
//  DEMO DATA
// ════════════════════════════════════════════════════════════════
/*
const DEMO_DATA = {
  Chicago: {
    geo: { lat: 41.85, lon: -87.65, country: 'US' },
    weather: { temp: 34, feels: 25, desc: 'Thunderstorm', wind: 47, humidity: 91, icon: '⛈', severity: 'high' },
    flights: { airport: 'ORD', delayed: 47, avgDelay: 138, cancelled: 9, worstFlight: 'UA 872 to LAX — 4h 18m late', severity: 'high' },
    quake:   { mag: '2.8', place: '18km NW of Joliet, IL', depth: '8.4', ago: '3 hours ago', severity: 'low' },
    traffic: { incidents: 23, worst: 'I-90/94 Dan Ryan — 14.2 mi backup', jams: 11, severity: 'mid' },
    air:     { aqi: 163, category: 'Unhealthy', pm25: 58.2, city: 'Chicago', severity: 'high' },
    disaster:{ type: 'Severe Storm', name: 'Midwest Derecho System', area: 'Illinois / Indiana', updated: '2h ago', severity: 'high' },
  },
  Houston: {
    geo: { lat: 29.76, lon: -95.37, country: 'US' },
    weather: { temp: 97, feels: 110, desc: 'Heat Advisory + Haze', wind: 12, humidity: 85, icon: '🌡', severity: 'high' },
    flights: { airport: 'IAH', delayed: 31, avgDelay: 95, cancelled: 4, worstFlight: 'CO 445 to JFK — 2h 55m late', severity: 'mid' },
    quake:   { mag: '3.1', place: '22km E of Baytown, TX', depth: '5.2', ago: '1 hour ago', severity: 'mid' },
    traffic: { incidents: 18, worst: 'I-45 South near downtown — 9.8 mi standstill', jams: 8, severity: 'mid' },
    air:     { aqi: 142, category: 'Unhealthy for Sensitive Groups', pm25: 42.1, city: 'Houston', severity: 'mid' },
    disaster:{ type: 'Wildfire Smoke', name: 'Texas Panhandle Fire Complex', area: 'SE Texas', updated: '5h ago', severity: 'mid' },
  },
  Mumbai: {
    geo: { lat: 19.08, lon: 72.88, country: 'IN' },
    weather: { temp: 102, feels: 119, desc: 'Cyclone Warning — Extreme', wind: 82, humidity: 97, icon: '🌀', severity: 'high' },
    flights: { airport: 'BOM', delayed: 89, avgDelay: 210, cancelled: 22, worstFlight: 'AI 131 to DEL — 6h 50m late', severity: 'high' },
    quake:   { mag: '4.2', place: '55km offshore, Arabian Sea', depth: '18.0', ago: '6 hours ago', severity: 'high' },
    traffic: { incidents: 61, worst: 'Western Express Hwy — 22km gridlock', jams: 34, severity: 'high' },
    air:     { aqi: 218, category: 'Very Unhealthy', pm25: 112.4, city: 'Mumbai', severity: 'high' },
    disaster:{ type: 'Cyclone', name: 'Cyclone Vayu', area: 'Gujarat / Maharashtra coast', updated: '1h ago', severity: 'high' },
  },
  London: {
    geo: { lat: 51.51, lon: -0.13, country: 'GB' },
    weather: { temp: 38, feels: 29, desc: 'Freezing Fog + Sleet', wind: 29, humidity: 96, icon: '🌫', severity: 'mid' },
    flights: { airport: 'LHR', delayed: 52, avgDelay: 115, cancelled: 11, worstFlight: 'BA 174 to JFK — 3h 45m late', severity: 'high' },
    quake:   { mag: '1.9', place: '8km SW of Dover', depth: '3.1', ago: '12 hours ago', severity: 'low' },
    traffic: { incidents: 38, worst: 'M25 Junction 10–12 — 17 mile queue', jams: 21, severity: 'high' },
    air:     { aqi: 88, category: 'Moderate', pm25: 22.3, city: 'London', severity: 'mid' },
    disaster:{ type: 'Flooding', name: 'Thames Valley Flood Alert', area: 'SE England', updated: '3h ago', severity: 'mid' },
  },
  Miami: {
    geo: { lat: 25.77, lon: -80.19, country: 'US' },
    weather: { temp: 92, feels: 107, desc: 'Tropical Storm Watch', wind: 54, humidity: 94, icon: '🌩', severity: 'high' },
    flights: { airport: 'MIA', delayed: 41, avgDelay: 160, cancelled: 7, worstFlight: 'AA 209 to BOS — 3h 10m late', severity: 'high' },
    quake:   { mag: '2.3', place: '40km E of Key West', depth: '12.0', ago: '8 hours ago', severity: 'low' },
    traffic: { incidents: 14, worst: 'I-95 NB near Broward — 8.5 mi backup', jams: 7, severity: 'mid' },
    air:     { aqi: 105, category: 'Unhealthy for Sensitive Groups', pm25: 33.7, city: 'Miami', severity: 'mid' },
    disaster:{ type: 'Tropical Storm', name: 'TS Beryl', area: 'South Florida / Bahamas', updated: '30m ago', severity: 'high' },
  },
  'Los Angeles': {
    geo: { lat: 34.05, lon: -118.24, country: 'US' },
    weather: { temp: 94, feels: 101, desc: 'Red Flag Warning — Fire Risk', wind: 38, humidity: 8, icon: '🔥', severity: 'high' },
    flights: { airport: 'LAX', delayed: 29, avgDelay: 88, cancelled: 3, worstFlight: 'DL 188 to ORD — 2h 28m late', severity: 'mid' },
    quake:   { mag: '3.7', place: '9km NE of Pasadena, CA', depth: '7.2', ago: '45 min ago', severity: 'mid' },
    traffic: { incidents: 44, worst: 'I-405 SB at Getty — 19 mi gridlock', jams: 26, severity: 'high' },
    air:     { aqi: 189, category: 'Unhealthy', pm25: 76.8, city: 'Los Angeles', severity: 'high' },
    disaster:{ type: 'Wildfire', name: 'Topanga Fire', area: 'LA County foothills', updated: '20m ago', severity: 'high' },
  },
  Delhi: {
    geo: { lat: 28.61, lon: 77.21, country: 'IN' },
    weather: { temp: 108, feels: 124, desc: 'Extreme Heat Wave', wind: 8, humidity: 22, icon: '☀️', severity: 'high' },
    flights: { airport: 'DEL', delayed: 63, avgDelay: 178, cancelled: 14, worstFlight: 'AI 888 to BOM — 5h 48m late', severity: 'high' },
    quake:   { mag: '2.1', place: '30km NW of Delhi', depth: '10.0', ago: '2 days ago', severity: 'low' },
    traffic: { incidents: 78, worst: 'NH-48 Gurugram corridor — 30km standstill', jams: 41, severity: 'high' },
    air:     { aqi: 312, category: 'Hazardous', pm25: 198.6, city: 'Delhi', severity: 'high' },
    disaster:{ type: 'Heat Wave', name: 'North India Heat Emergency', area: 'Delhi NCR / UP / Haryana', updated: '1h ago', severity: 'high' },
  },
};

function getDemoCity(city) {
  const key = Object.keys(DEMO_DATA).find(k => k.toLowerCase() === city.toLowerCase());
  return DEMO_DATA[key] || DEMO_DATA['Chicago'];
}
*/
// ════════════════════════════════════════════════════════════════
//  HALL OF MISERY — loads on page open
// ════════════════════════════════════════════════════════════════

// Category configs for the 6 leaderboard cards
const HOM_CATEGORIES = [
  {
    id: 'hom-weather',
    cat: 'cat-weather',
    label: 'WORST WEATHER',
    icon: '⛈',
    desc: 'Most extreme conditions right now',
    fetch: fetchHOMWeather,
  },
  {
    id: 'hom-flights',
    cat: 'cat-flights',
    label: 'WORST AIRPORT',
    icon: '✈️',
    desc: 'Most flight delays globally',
    fetch: fetchHOMFlights,
  },
  {
    id: 'hom-quake',
    cat: 'cat-quake',
    label: 'BIGGEST QUAKE',
    icon: '🌍',
    desc: 'Largest earthquake in last 24h',
    fetch: fetchHOMQuake,
  },
  {
    id: 'hom-traffic',
    cat: 'cat-traffic',
    label: 'WORST TRAFFIC',
    icon: '🚗',
    desc: 'Most gridlocked city right now',
    fetch: fetchHOMTraffic,
  },
  {
    id: 'hom-air',
    cat: 'cat-air',
    label: 'WORST AIR QUALITY',
    icon: '😷',
    desc: 'Highest pollution index today',
    fetch: fetchHOMAir,
  },
  {
    id: 'hom-disaster',
    cat: 'cat-disaster',
    label: 'ACTIVE DISASTER',
    icon: '🚨',
    desc: 'NASA EONET natural event feed',
    fetch: fetchHOMDisaster,
  },
];

async function initHallOfMisery() {
  const grid = document.getElementById('homGrid');
  // Render skeleton loading cards
  grid.innerHTML = HOM_CATEGORIES.map(c => `
    <div class="hom-card ${c.cat}" id="${c.id}">
      <div class="hom-cat"><span class="hom-cat-dot"></span>${c.label}</div>
      <div class="hom-loading"><div class="hom-spinner"></div>scanning...</div>
    </div>`).join('');

  // Fetch all categories in parallel
  await Promise.all(HOM_CATEGORIES.map(async (c) => {
    try {
      const data = await c.fetch();
      renderHOMCard(c, data);
    } catch(e) {
      document.getElementById(c.id).innerHTML = `
        <div class="hom-cat"><span class="hom-cat-dot"></span>${c.label}</div>
        <div class="hom-loading" style="color:var(--orange)">⚠ API unavailable in demo</div>`;
    }
  }));
}

function renderHOMCard(c, d) {
  const el = document.getElementById(c.id);
  el.innerHTML = `
    <div class="hom-cat"><span class="hom-cat-dot"></span>${c.label}</div>
    <div class="hom-rank">#1 WORST</div>
    <div class="hom-winner">${d.winner}</div>
    <div class="hom-stat">${d.stat}</div>
    <div class="hom-desc">${d.desc}</div>
    ${d.rankList ? `<ul class="hom-rank-list">${d.rankList.map((r,i)=>`
      <li>
        <span class="rank-num">#${i+2}</span>
        <span class="rank-city">${r.city}</span>
        <span class="rank-val">${r.val}</span>
      </li>`).join('')}</ul>` : ''}
    <div class="hom-quip">${d.quip}</div>
    <div class="hom-click-hint">↗ CLICK TO SCAN THIS LOCATION</div>`;
  if (d.clickCity) {
    el.onclick = () => setCity(d.clickCity);
    el.style.cursor = 'pointer';
  }
}

// ── HOM: Weather (OpenWeatherMap — poll a fixed global misery list) ──
async function fetchHOMWeather() {
  const candidates = ['Mumbai','Delhi','Dubai','Houston','Phoenix','Miami','Karachi','Baghdad','Riyadh'];
  if (DEMO) {
    await delay(400);
    return {
      winner: 'Delhi, IN', stat: '124°F', clickCity: 'Delhi',
      desc: 'Extreme heat wave — feels like 124°F, humidity 22%, barely breathable.',
      rankList: [
        { city: 'Dubai, UAE',  val: '118°F feels-like' },
        { city: 'Phoenix, US', val: '112°F feels-like' },
        { city: 'Karachi, PK', val: '109°F feels-like' },
      ],
      quip: '"The tarmac is literally melting. Literal tarmac."',
    };
  }
  const results = await Promise.all(candidates.map(async city => {
    try {
      const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${K.OPENWEATHER}&units=imperial`);
      const d = await r.json();
      return { city, feels: d.main.feels_like, temp: d.main.temp, desc: d.weather[0].description };
    } catch { return null; }
  }));
  const sorted = results.filter(Boolean).sort((a,b) => b.feels - a.feels);
  const top = sorted[0];
  return {
    winner: top.city, stat: `${Math.round(top.feels)}°F`, clickCity: top.city,
    desc: `${top.desc} — actual temp ${Math.round(top.temp)}°F, feels like ${Math.round(top.feels)}°F.`,
    rankList: sorted.slice(1,4).map(r => ({ city: r.city, val: `${Math.round(r.feels)}°F feels-like` })),
    quip: '"Someone is outside in that right now. Unironically."',
  };
}

// ── HOM: Flights (AviationStack) ──────────────────────────────────
async function fetchHOMFlights() {
  const airports = [
    { city: 'Chicago',     code: 'ORD' },
    { city: 'Atlanta',     code: 'ATL' },
    { city: 'London',      code: 'LHR' },
    { city: 'New York',    code: 'JFK' },
    { city: 'Mumbai',      code: 'BOM' },
    { city: 'Los Angeles', code: 'LAX' },
    { city: 'Delhi',       code: 'DEL' },
  ];
  if (DEMO) {
    await delay(600);
    return {
      winner: 'Mumbai — BOM', stat: '89 delayed', clickCity: 'Mumbai',
      desc: 'Cyclone Vayu has decimated schedules. 89 flights delayed, 22 cancelled, avg wait over 3.5 hours.',
      rankList: [
        { city: 'Delhi — DEL',    val: '63 delayed' },
        { city: 'Chicago — ORD',  val: '47 delayed' },
        { city: 'London — LHR',   val: '52 delayed' },
      ],
      quip: '"The departure board is basically modern art at this point."',
    };
  }
  const results = await Promise.all(airports.map(async a => {
    try {
      const r = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${K.AVIATIONSTACK}&dep_iata=${a.code}&flight_status=active&limit=100`);
      const d = await r.json();
      const delayed = (d.data||[]).filter(f => (f.departure?.delay||0) > 30).length;
      return { ...a, delayed };
    } catch { return { ...a, delayed: 0 }; }
  }));
  const sorted = results.sort((a,b) => b.delayed - a.delayed);
  const top = sorted[0];
  return {
    winner: `${top.city} — ${top.code}`, stat: `${top.delayed} delayed`, clickCity: top.city,
    desc: `${top.delayed} flights delayed over 30 minutes at ${top.code} right now.`,
    rankList: sorted.slice(1,4).map(r => ({ city: `${r.city} — ${r.code}`, val: `${r.delayed} delayed` })),
    quip: '"Grab a power outlet and an overpriced sandwich. You\'re here a while."',
  };
}

// ── HOM: Earthquake (USGS — no key) ──────────────────────────────
async function fetchHOMQuake() {
  if (DEMO) {
    await delay(300);
    return {
      winner: 'Arabian Sea', stat: 'M 4.2', clickCity: 'Mumbai',
      desc: '55km offshore near Mumbai. Depth 18km. Felt across the Maharashtra coast.',
      rankList: [
        { city: 'Pasadena, CA',  val: 'M 3.7' },
        { city: 'Baytown, TX',   val: 'M 3.1' },
        { city: 'Joliet, IL',    val: 'M 2.8' },
      ],
      quip: '"Tectonic plates also having a rough one today."',
    };
  }
  const now = new Date();
  const past24h = new Date(now - 24*60*60*1000).toISOString();
  const r = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past24h}&minmagnitude=1.5&orderby=magnitude&limit=10`);
  const d = await r.json();
  const quakes = d.features || [];
  if (!quakes.length) return { winner: 'None today', stat: 'M 0.0', desc: 'No significant quakes in last 24h. Enjoy it.', quip: '"Quiet earth day. Suspicious."' };
  const top = quakes[0];
  return {
    winner: top.properties.place, stat: `M ${top.properties.mag.toFixed(1)}`,
    desc: `Magnitude ${top.properties.mag.toFixed(1)} — ${top.properties.place}. Depth ${top.geometry.coordinates[2].toFixed(0)}km.`,
    rankList: quakes.slice(1,4).map(q => ({ city: q.properties.place.split(',').pop().trim() || q.properties.place, val: `M ${q.properties.mag.toFixed(1)}` })),
    quip: '"The ground itself had enough today."',
  };
}

// ── HOM: Traffic (TomTom — poll major city bboxes) ───────────────
async function fetchHOMTraffic() {
  const cities = [
    { city: 'Los Angeles', lat: 34.05,  lon: -118.24 },
    { city: 'Mumbai',      lat: 19.08,  lon:   72.88 },
    { city: 'Bangkok',     lat: 13.75,  lon:  100.52 },
    { city: 'London',      lat: 51.51,  lon:   -0.13 },
    { city: 'Delhi',       lat: 28.61,  lon:   77.21 },
    { city: 'Cairo',       lat: 30.04,  lon:   31.24 },
  ];
  if (DEMO) {
    await delay(500);
    return {
      winner: 'Delhi, IN', stat: '78 incidents', clickCity: 'Delhi',
      desc: '78 active traffic incidents, 41 confirmed gridlock zones. NH-48 is a parking lot.',
      rankList: [
        { city: 'Los Angeles, US', val: '44 incidents' },
        { city: 'Mumbai, IN',      val: '61 incidents' },
        { city: 'London, GB',      val: '38 incidents' },
      ],
      quip: '"Three lanes became a suggestion, then a memory."',
    };
  }
  const results = await Promise.all(cities.map(async c => {
    try {
      const d = 0.4;
      const bbox = `${c.lon-d},${c.lat-d},${c.lon+d},${c.lat+d}`;
      const r = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${K.TOMTOM}&bbox=${bbox}&fields={incidents{properties{id}}}&language=en-US&timeValidityFilter=present`);
      const data = await r.json();
      return { ...c, count: (data.incidents||[]).length };
    } catch { return { ...c, count: 0 }; }
  }));
  const sorted = results.sort((a,b) => b.count - a.count);
  const top = sorted[0];
  return {
    winner: top.city, stat: `${top.count} incidents`, clickCity: top.city,
    desc: `${top.count} active traffic incidents detected around ${top.city}.`,
    rankList: sorted.slice(1,4).map(r => ({ city: r.city, val: `${r.count} incidents` })),
    quip: '"The road to misery is paved with brake lights."',
  };
}

// ── HOM: Air Quality (OpenAQ — free, no key) ─────────────────────
async function fetchHOMAir() {
  if (DEMO) {
    await delay(550);
    return {
      winner: 'Delhi, IN', stat: 'AQI 312', clickCity: 'Delhi',
      desc: 'PM2.5 at 198.6 µg/m³ — classified Hazardous. Masks mandatory outdoors.',
      rankList: [
        { city: 'Mumbai, IN',      val: 'AQI 218' },
        { city: 'Los Angeles, US', val: 'AQI 189' },
        { city: 'Chicago, US',     val: 'AQI 163' },
      ],
      quip: '"The air quality app just started crying when it opened."',
    };
  }
  // OpenAQ v3 — fetch latest measurements for a set of known polluted cities
  const cities = ['Delhi','Mumbai','Beijing','Lahore','Dhaka','Chicago','Los Angeles','Cairo'];
  const results = await Promise.all(cities.map(async city => {
    try {
      const r = await fetch(`https://api.openaq.org/v3/locations?city=${encodeURIComponent(city)}&limit=1&order_by=lastUpdated`);
      const d = await r.json();
      const loc = d.results?.[0];
      if (!loc) return null;
      // Get latest parameter reading
      const pm = loc.sensors?.find(s => s.parameter?.name === 'pm25' || s.parameter?.name === 'pm2.5');
      const aqi = pm ? Math.round(pm.latest?.value * 1.5) : null; // rough AQI estimate
      return aqi ? { city, aqi, pm25: pm.latest?.value } : null;
    } catch { return null; }
  }));
  const sorted = results.filter(Boolean).sort((a,b) => b.aqi - a.aqi);
  if (!sorted.length) throw new Error('No AQ data');
  const top = sorted[0];
  const cat = top.aqi > 300 ? 'Hazardous' : top.aqi > 200 ? 'Very Unhealthy' : top.aqi > 150 ? 'Unhealthy' : 'Unhealthy for Sensitive Groups';
  return {
    winner: top.city, stat: `AQI ${top.aqi}`, clickCity: top.city,
    desc: `PM2.5 at ${top.pm25} µg/m³ — ${cat}. Air quality is actively harming anyone outside.`,
    rankList: sorted.slice(1,4).map(r => ({ city: r.city, val: `AQI ${r.aqi}` })),
    quip: '"The air quality app just started crying when it opened."',
  };
}

// ── HOM: Natural Disasters (NASA EONET — no key) ──────────────────
async function fetchHOMDisaster() {
  if (DEMO) {
    await delay(400);
    return {
      winner: 'Cyclone Vayu', stat: 'CYCLONE', clickCity: 'Mumbai',
      desc: 'Active cyclone off Maharashtra/Gujarat coast. Wind speeds 120km/h. NASA EONET event.',
      rankList: [
        { city: 'Topanga Fire, CA',          val: 'Wildfire' },
        { city: 'Thames Valley, UK',         val: 'Flooding' },
        { city: 'North India Heat Emergency',val: 'Extreme Heat' },
      ],
      quip: '"NASA is tracking it. That\'s never a good sign."',
    };
  }
  const r = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20&days=3');
  const d = await r.json();
  const events = (d.events || []).filter(e => e.categories?.length);
  if (!events.length) return {
    winner: 'Nothing today', stat: 'CLEAR', desc: 'No active natural disaster events. Rare.', quip: '"NASA is bored. That\'s actually great."'
  };
  const top = events[0];
  const catName = top.categories[0]?.title || 'Event';
  const geo = top.geometry?.[0]?.coordinates;
  return {
    winner: top.title, stat: catName.toUpperCase(),
    desc: `${top.title} — active NASA EONET event. Category: ${catName}. Sources: ${top.sources?.length || 1}.`,
    rankList: events.slice(1,4).map(e => ({ city: e.title.slice(0,28), val: e.categories[0]?.title || '—' })),
    quip: '"NASA is tracking it. That\'s never a good sign."',
  };
}

// ════════════════════════════════════════════════════════════════
//  PER-CITY API FETCHES
// ════════════════════════════════════════════════════════════════

async function geocode(city) {
  if (DEMO) return getDemoCity(city).geo;
  const r = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${K.OPENWEATHER}`);
  const d = await r.json();
  if (!d.length) throw new Error(`City "${city}" not found`);
  return { lat: d[0].lat, lon: d[0].lon, country: d[0].country };
}

async function fetchWeather(city) {
  if (DEMO) { await delay(300); return getDemoCity(city).weather; }
  const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${K.OPENWEATHER}&units=imperial`);
  if (!r.ok) throw new Error('Weather API error');
  const d = await r.json();
  const desc = d.weather[0].main;
  const severity = ['Thunderstorm','Tornado','Squall','Hurricane','Tropical'].some(w => desc.includes(w)) ? 'high'
    : ['Rain','Snow','Sleet','Fog','Drizzle','Mist'].some(w => desc.includes(w)) ? 'mid' : 'low';
  const icons = { Thunderstorm:'⛈',Drizzle:'🌦',Rain:'🌧',Snow:'🌨',Mist:'🌫',Fog:'🌫',Clear:'☀️',Clouds:'☁️',Tornado:'🌪',Squall:'💨' };
  return { temp: Math.round(d.main.temp), feels: Math.round(d.main.feels_like), desc: d.weather[0].description, wind: Math.round(d.wind.speed), humidity: d.main.humidity, icon: icons[desc] || '🌡', severity };
}

async function fetchFlights(city) {
  if (DEMO) { await delay(500); return getDemoCity(city).flights; }
  const r = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${K.AVIATIONSTACK}&dep_city=${encodeURIComponent(city)}&flight_status=active&limit=100`);
  if (!r.ok) throw new Error('Flights API error');
  const d = await r.json();
  const delayed = (d.data||[]).filter(f => (f.departure?.delay||0) > 30);
  const cancelled = (d.data||[]).filter(f => f.flight_status === 'cancelled');
  const avgDelay = delayed.length ? Math.round(delayed.reduce((a,f) => a + (f.departure.delay||0), 0) / delayed.length) : 0;
  const worst = [...delayed].sort((a,b) => (b.departure?.delay||0) - (a.departure?.delay||0))[0];
  const worstText = worst ? `${worst.flight?.iata||'Flight'} to ${worst.arrival?.iata||'?'} — ${Math.floor((worst.departure.delay||0)/60)}h ${(worst.departure.delay||0)%60}m late` : 'No severe delays';
  const severity = delayed.length > 40 ? 'high' : delayed.length > 15 ? 'mid' : 'low';
  return { airport: worst?.departure?.iata || city.slice(0,3).toUpperCase(), delayed: delayed.length, avgDelay, cancelled: cancelled.length, worstFlight: worstText, severity };
}

async function fetchEarthquake(lat, lon) {
  if (DEMO) { await delay(250); return getDemoCity(currentCity).quake; }
  const past7 = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
  const r = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradius=5&minmagnitude=1.0&orderby=magnitude&limit=5&starttime=${past7}`);
  const d = await r.json();
  if (!d.features?.length) return { mag: '0.0', place: 'No recent quakes nearby', depth: '0', ago: '', severity: 'low' };
  const q = d.features[0].properties;
  const g = d.features[0].geometry;
  const minsAgo = Math.round((Date.now() - q.time) / 60000);
  const ago = minsAgo < 60 ? `${minsAgo} min ago` : minsAgo < 1440 ? `${Math.round(minsAgo/60)}h ago` : `${Math.round(minsAgo/1440)}d ago`;
  return { mag: q.mag.toFixed(1), place: q.place, depth: g.coordinates[2].toFixed(1), ago, severity: q.mag >= 4 ? 'high' : q.mag >= 2.5 ? 'mid' : 'low' };
}

async function fetchTraffic(lat, lon) {
  if (DEMO) { await delay(400); return getDemoCity(currentCity).traffic; }
  const d = 0.45;
  const bbox = `${lon-d},${lat-d},${lon+d},${lat+d}`;
  const r = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${K.TOMTOM}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{id,events{description},delay}}}&language=en-US&categoryFilter=0,1,2,3,4,5,6,7&timeValidityFilter=present`);
  if (!r.ok) throw new Error('Traffic API error');
  const data = await r.json();
  const incidents = data.incidents || [];
  const jams = incidents.filter(i => i.properties?.events?.some(e => /jam|congestion/i.test(e.description||'')));
  const worst = [...incidents].sort((a,b) => (b.properties?.delay||0) - (a.properties?.delay||0))[0];
  const worstText = worst?.properties?.events?.[0]?.description || 'Heavy congestion in multiple areas';
  return { incidents: incidents.length, worst: worstText, jams: jams.length, severity: incidents.length > 30 ? 'high' : incidents.length > 10 ? 'mid' : 'low' };
}

async function fetchAirQuality(lat, lon, city) {
  if (DEMO) { await delay(350); return getDemoCity(city).air; }
  // OpenAQ v3 — nearest station
  try {
    const r = await fetch(`https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=25000&limit=5&order_by=lastUpdated`);
    const d = await r.json();
    const locs = d.results || [];
    let bestAqi = 0, bestCity = city, pm25 = 0;
    for (const loc of locs) {
      const pm = loc.sensors?.find(s => /pm2\.?5/i.test(s.parameter?.name || ''));
      if (pm?.latest?.value) {
        const aqi = Math.round(pm.latest.value * 1.5);
        if (aqi > bestAqi) { bestAqi = aqi; pm25 = pm.latest.value; bestCity = loc.name || city; }
      }
    }
    if (!bestAqi) return { aqi: 0, category: 'Unknown', pm25: 0, city, severity: 'low' };
    const cat = bestAqi > 300 ? 'Hazardous' : bestAqi > 200 ? 'Very Unhealthy' : bestAqi > 150 ? 'Unhealthy' : bestAqi > 100 ? 'Unhealthy for Sensitive Groups' : bestAqi > 50 ? 'Moderate' : 'Good';
    const sev = bestAqi > 150 ? 'high' : bestAqi > 100 ? 'mid' : 'low';
    return { aqi: bestAqi, category: cat, pm25, city: bestCity, severity: sev };
  } catch { return { aqi: 0, category: 'Unavailable', pm25: 0, city, severity: 'low' }; }
}

async function fetchNASADisaster(lat, lon) {
  if (DEMO) { await delay(300); return getDemoCity(currentCity).disaster; }
  try {
    const r = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50&days=7');
    const d = await r.json();
    // Find nearest event by geometry
    const events = (d.events||[]).filter(e => e.geometry?.length);
    let nearest = null, minDist = Infinity;
    for (const e of events) {
      const g = e.geometry[0]?.coordinates;
      if (!g) continue;
      const [eLon, eLat] = Array.isArray(g[0]) ? g[0] : g;
      const dist = Math.sqrt((lat - eLat)**2 + (lon - eLon)**2);
      if (dist < minDist) { minDist = dist; nearest = e; }
    }
    if (!nearest) return { type: 'None nearby', name: 'No active events', area: 'Clear', updated: 'N/A', severity: 'low' };
    const cat = nearest.categories[0]?.title || 'Event';
    return { type: cat, name: nearest.title, area: nearest.title, updated: `${Math.round((Date.now() - new Date(nearest.geometry[0]?.date)) / 3600000)}h ago`, severity: cat === 'Volcanoes' || cat === 'Wildfires' ? 'high' : 'mid' };
  } catch { return { type: 'Unknown', name: 'API unavailable', area: '—', updated: '—', severity: 'low' }; }
}

// ════════════════════════════════════════════════════════════════
//  SCORING & COPY
// ════════════════════════════════════════════════════════════════

function calcMisery(weather, flights, quake, traffic, air) {
  let s = 0;
  s += weather.severity === 'high' ? 25 : weather.severity === 'mid' ? 14 : 4;
  if (weather.wind > 60) s += 4;
  s += Math.min(22, Math.round(flights.delayed * 0.35 + flights.avgDelay * 0.04));
  s += Math.min(16, Math.round(parseFloat(quake.mag) * 3.8));
  s += Math.min(16, Math.round(traffic.incidents * 0.4 + traffic.jams * 0.35));
  s += air.severity === 'high' ? 12 : air.severity === 'mid' ? 6 : 2;
  return Math.min(99, s);
}

function buildHeadline(city, weather, flights, quake, traffic, air) {
  const options = [
    `While you relax, someone at ${flights.airport} just got their ${Math.floor(flights.avgDelay/60)}h ${flights.avgDelay%60}m delay announcement.`,
    `${city}: ${flights.delayed} flights grounded, magnitude ${quake.mag} quake, and AQI ${air.aqi} air. Your day was fine.`,
    `A ${weather.desc.toLowerCase()} is hammering ${city} while ${flights.delayed} flights sit idle. The air quality makes it worse.`,
    `Today in ${city}: M${quake.mag} quake, ${flights.cancelled} cancelled flights, ${traffic.incidents} traffic incidents, AQI ${air.aqi}. Your commute was fine.`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function buildBody(city, weather, flights, quake, traffic, air, disaster) {
  const p = [];
  if (weather.severity !== 'low') p.push(`A ${weather.desc.toLowerCase()} is hammering ${city} — winds ${weather.wind} mph, feels like ${weather.feels}°F.`);
  if (flights.delayed > 0) p.push(`${flights.delayed} flights delayed at ${flights.airport} (${flights.cancelled} cancelled), average wait ${Math.floor(flights.avgDelay/60)}h ${flights.avgDelay%60}m.`);
  if (parseFloat(quake.mag) >= 1.5) p.push(`M${quake.mag} earthquake: ${quake.place} ${quake.ago}.`);
  if (traffic.incidents > 0) p.push(`${traffic.incidents} traffic incidents, ${traffic.jams} gridlock zones.`);
  if (air.aqi > 100) p.push(`Air quality is ${air.category} (AQI ${air.aqi}, PM2.5 ${air.pm25} µg/m³).`);
  if (disaster.type && disaster.type !== 'None nearby' && disaster.type !== 'Unknown') p.push(`NASA EONET: ${disaster.name} (${disaster.type}) is active in the region.`);
  return p.join(' ') || `Multiple disruptions affecting ${city} right now.`;
}

function buildTicker(city, weather, flights, quake, traffic, air, disaster) {
  const items = [
    `${flights.airport} — ${flights.delayed} flights delayed · avg wait ${Math.floor(flights.avgDelay/60)}h ${flights.avgDelay%60}m`,
    `WEATHER: ${weather.desc} · feels ${weather.feels}°F · wind ${weather.wind}mph`,
    `QUAKE: M${quake.mag} · ${quake.place} · ${quake.ago}`,
    `TRAFFIC: ${traffic.incidents} incidents · ${traffic.jams} gridlock zones in ${city}`,
    `AIR QUALITY: AQI ${air.aqi} — ${air.category}`,
    `NASA EONET: ${disaster.name} — ${disaster.type}`,
    `WORST FLIGHT: ${flights.worstFlight}`,
    `WORST JAM: ${traffic.worst}`,
  ];
  const doubled = [...items, ...items];
  return doubled.map(t => `<span>${t}</span>`).join('');
}

function renderCard(apiTag, icon, value, label, detail, quip, severity) {
  return `
    <div class="card severity-${severity} visible">
      <div class="card-accent"></div>
      <div class="card-api-tag">${apiTag}</div>
      <div class="card-icon">${icon}</div>
      <div class="card-value">${value}</div>
      <div class="card-label">${label}</div>
      <div class="card-detail">${detail}</div>
      <div class="card-quip">${quip}</div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  MAIN SCAN
// ════════════════════════════════════════════════════════════════

async function fetchAllData() {
  const raw = document.getElementById('cityInput').value.trim();
  if (!raw) { showError('Please enter a city name first.'); return; }
  currentCity = raw.split(',')[0].trim();
  const city = currentCity;

  showLoading('LOCATING DISASTER ZONE…');
  setStatus('SCANNING…');
  if (DEMO) document.getElementById('demoBanner').style.display = 'block';

  try {
    document.getElementById('loadingText').textContent = 'PINNING COORDINATES…';
    const geo = await geocode(city);

    document.getElementById('loadingText').textContent = 'CHECKING WEATHER & FLIGHTS…';
    const [weather, flights] = await Promise.all([fetchWeather(city), fetchFlights(city)]);

    document.getElementById('loadingText').textContent = 'CHECKING SEISMIC, TRAFFIC, AIR…';
    const [quake, traffic, air, disaster] = await Promise.all([
      fetchEarthquake(geo.lat, geo.lon),
      fetchTraffic(geo.lat, geo.lon),
      fetchAirQuality(geo.lat, geo.lon, city),
      fetchNASADisaster(geo.lat, geo.lon),
    ]);

    hideLoading();
    document.getElementById('resultsHeading').style.display = '';

    const score = calcMisery(weather, flights, quake, traffic, air);

    // Hero
    document.getElementById('heroLocation').textContent = `📍 ${city.toUpperCase()}${geo.country ? ', ' + geo.country : ''}`;
    document.getElementById('heroHeadline').textContent = buildHeadline(city, weather, flights, quake, traffic, air);
    document.getElementById('heroBody').textContent     = buildBody(city, weather, flights, quake, traffic, air, disaster);
    document.getElementById('miseryNumber').textContent = score;
    document.getElementById('heroCard').classList.add('visible');

    // Ticker
    document.getElementById('tickerInner').innerHTML = buildTicker(city, weather, flights, quake, traffic, air, disaster);
    document.getElementById('tickerWrap').style.display = 'block';

    // Cards
    const flightDelay = `${Math.floor(flights.avgDelay/60)}h ${flights.avgDelay%60}m`;
    document.getElementById('dataGrid').innerHTML =
      renderCard('OpenWeatherMap', weather.icon, `${weather.temp}°F`,
        `${weather.desc.charAt(0).toUpperCase()+weather.desc.slice(1)}`,
        `Feels like ${weather.feels}°F · Wind ${weather.wind} mph · Humidity ${weather.humidity}%`,
        `"${weather.feels < 20 ? 'Frostbite territory. Exposed skin in minutes.' : weather.feels > 100 ? 'Heat index above 100°F. Eggs cook on pavement.' : weather.wind > 50 ? 'You\'d lose an umbrella in 3 seconds.' : 'Not ideal flying weather, evidently.'}"`,
        weather.severity) +

      renderCard('AviationStack', '✈️', flights.delayed.toString(),
        `Flights Delayed at ${flights.airport}`,
        `Avg delay: ${flightDelay} · ${flights.cancelled} cancelled · ${flights.worstFlight}`,
        `"${flights.avgDelay > 180 ? 'Longer than a feature film. Hope they have snacks.' : flights.avgDelay > 90 ? 'Almost two hours staring at the departures board.' : 'Long enough to regret not taking the train.'}"`,
        flights.severity) +

      renderCard('USGS Seismic API', '🌍', `M${quake.mag}`,
        `Earthquake — ${quake.place}`,
        `Depth: ${quake.depth} km · ${quake.ago}`,
        `"${parseFloat(quake.mag) >= 4 ? 'Strong enough to knock things off shelves.' : parseFloat(quake.mag) >= 2.5 ? 'Felt by residents. Coffee cups rattled.' : 'Barely felt — but the ground still moved.'}"`,
        quake.severity) +

      renderCard('TomTom Traffic API', '🚗', traffic.incidents.toString(),
        'Active Traffic Incidents',
        `${traffic.jams} gridlock zones · ${traffic.worst}`,
        `"${traffic.incidents > 40 ? 'The city is one giant parking lot.' : traffic.incidents > 15 ? 'GPS suggesting routes that don\'t exist.' : 'At least someone\'s still moving.'}"`,
        traffic.severity) +

      renderCard('OpenAQ Air Quality', '😷', `AQI ${air.aqi}`,
        `${air.category}`,
        `PM2.5: ${air.pm25} µg/m³ · Station: ${air.city}`,
        `"${air.aqi > 300 ? 'Hazardous. The air is genuinely trying to hurt you.' : air.aqi > 200 ? 'Very unhealthy. Everyone should be inside.' : air.aqi > 150 ? 'Unhealthy. Limit your outdoor exposure.' : air.aqi > 100 ? 'Sensitive groups should stay indoors.' : 'Breathable. Minor win.'}"`,
        air.severity) +

      renderCard('NASA EONET', '🛰️', disaster.type.toUpperCase(),
        `${disaster.name}`,
        `Area: ${disaster.area} · Updated: ${disaster.updated}`,
        `"${disaster.severity === 'high' ? 'NASA is tracking it. That\'s never a great sign.' : 'Active natural event in the region. Stay informed.'}"`,
        disaster.severity);

    setStatus(`LIVE DATA — ${city.toUpperCase()} — MISERY INDEX ${score}/100`, true);

  } catch (err) {
    showError(err.message || 'Fetch failed. Check your API keys in keys.js.');
    console.error(err);
  }
}

// ── Enter key ─────────────────────────────────────────────────────
document.getElementById('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchAllData();
});

// ── Init Hall of Misery on load ───────────────────────────────────
initHallOfMisery();