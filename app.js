// ConvertLab — unit data and conversion logic

// Linear categories: each unit's factor converts it to the SI base unit.
// Temperature is not linear, so its units carry toBase/fromBase functions (base: kelvin).
const CATEGORIES = {
  length: {
    defaults: ['m', 'ft'],
    units: {
      m:   { name: 'Meter',         symbol: 'm',   factor: 1 },
      km:  { name: 'Kilometer',     symbol: 'km',  factor: 1000 },
      cm:  { name: 'Centimeter',    symbol: 'cm',  factor: 0.01 },
      mm:  { name: 'Millimeter',    symbol: 'mm',  factor: 0.001 },
      um:  { name: 'Micrometer',    symbol: 'µm',  factor: 1e-6 },
      nm:  { name: 'Nanometer',     symbol: 'nm',  factor: 1e-9 },
      in:  { name: 'Inch',          symbol: 'in',  factor: 0.0254 },
      ft:  { name: 'Foot',          symbol: 'ft',  factor: 0.3048 },
      yd:  { name: 'Yard',          symbol: 'yd',  factor: 0.9144 },
      mi:  { name: 'Mile',          symbol: 'mi',  factor: 1609.344 },
      nmi: { name: 'Nautical mile', symbol: 'nmi', factor: 1852 }
    }
  },

  mass: {
    defaults: ['kg', 'lb'],
    units: {
      kg:   { name: 'Kilogram',       symbol: 'kg',     factor: 1 },
      g:    { name: 'Gram',           symbol: 'g',      factor: 0.001 },
      mg:   { name: 'Milligram',      symbol: 'mg',     factor: 1e-6 },
      t:    { name: 'Metric ton',     symbol: 't',      factor: 1000 },
      lb:   { name: 'Pound',          symbol: 'lb',     factor: 0.45359237 },
      oz:   { name: 'Ounce',          symbol: 'oz',     factor: 0.028349523125 },
      slug: { name: 'Slug',           symbol: 'slug',   factor: 14.59390294 },
      ston: { name: 'Short ton (US)', symbol: 'sh tn',  factor: 907.18474 },
      lton: { name: 'Long ton (UK)',  symbol: 'long tn', factor: 1016.0469088 }
    }
  },

  pressure: {
    defaults: ['bar', 'psi'],
    units: {
      Pa:   { name: 'Pascal',              symbol: 'Pa',   factor: 1 },
      kPa:  { name: 'Kilopascal',          symbol: 'kPa',  factor: 1000 },
      MPa:  { name: 'Megapascal',          symbol: 'MPa',  factor: 1e6 },
      bar:  { name: 'Bar',                 symbol: 'bar',  factor: 1e5 },
      mbar: { name: 'Millibar',            symbol: 'mbar', factor: 100 },
      atm:  { name: 'Standard atmosphere', symbol: 'atm',  factor: 101325 },
      psi:  { name: 'Pound per sq. inch',  symbol: 'psi',  factor: 6894.757293168 },
      torr: { name: 'Torr',                symbol: 'Torr', factor: 101325 / 760 },
      mmHg: { name: 'Millimeter of mercury', symbol: 'mmHg', factor: 133.322387415 },
      inHg: { name: 'Inch of mercury',     symbol: 'inHg', factor: 3386.389 }
    }
  },

  energy: {
    defaults: ['kJ', 'BTU'],
    units: {
      J:    { name: 'Joule',         symbol: 'J',      factor: 1 },
      kJ:   { name: 'Kilojoule',     symbol: 'kJ',     factor: 1000 },
      MJ:   { name: 'Megajoule',     symbol: 'MJ',     factor: 1e6 },
      Wh:   { name: 'Watt-hour',     symbol: 'Wh',     factor: 3600 },
      kWh:  { name: 'Kilowatt-hour', symbol: 'kWh',    factor: 3.6e6 },
      cal:  { name: 'Calorie (th)',  symbol: 'cal',    factor: 4.184 },
      kcal: { name: 'Kilocalorie (th)', symbol: 'kcal', factor: 4184 },
      BTU:  { name: 'BTU (IT)',      symbol: 'BTU',    factor: 1055.05585262 },
      ftlb: { name: 'Foot-pound',    symbol: 'ft·lbf', factor: 1.3558179483314004 },
      eV:   { name: 'Electronvolt',  symbol: 'eV',     factor: 1.602176634e-19 }
    }
  },

  temperature: {
    defaults: ['C', 'F'],
    units: {
      C: { name: 'Celsius',    symbol: '°C', toBase: c => c + 273.15,           fromBase: k => k - 273.15 },
      F: { name: 'Fahrenheit', symbol: '°F', toBase: f => (f + 459.67) * 5 / 9, fromBase: k => k * 9 / 5 - 459.67 },
      K: { name: 'Kelvin',     symbol: 'K',  toBase: k => k,                    fromBase: k => k },
      R: { name: 'Rankine',    symbol: '°R', toBase: r => r * 5 / 9,            fromBase: k => k * 9 / 5 }
    }
  }
};

function convert(value, from, to) {
  const base = from.toBase ? from.toBase(value) : value * from.factor;
  return to.fromBase ? to.fromBase(base) : base / to.factor;
}

// 8 significant figures; scientific notation for very large or very small magnitudes.
function format(n) {
  if (!Number.isFinite(n)) return '—';
  const rounded = Number(n.toPrecision(8));
  if (rounded === 0) return '0';
  const abs = Math.abs(rounded);
  if (abs >= 1e9 || abs < 1e-4) {
    const [mantissa, exponent] = rounded.toExponential().split('e');
    return `${mantissa} × 10^${Number(exponent)}`;
  }
  return rounded.toLocaleString('en-US', { maximumSignificantDigits: 8 });
}

// ---------- UI ----------

const tabs = document.querySelectorAll('.tab');
const panel = document.getElementById('panel');
const valueInput = document.getElementById('value');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const resultOutput = document.getElementById('result');
const formulaLine = document.getElementById('formula');
const categoryName = document.getElementById('category-name');
const allUnitsList = document.getElementById('all-units');
const swapButton = document.getElementById('swap');

const ohmPanel = document.getElementById('ohm-panel');
const voltageInput = document.getElementById('voltage');
const resistanceInput = document.getElementById('resistance');
const currentOutput = document.getElementById('current');
const powerOutput = document.getElementById('power');
const ohmNote = document.getElementById('ohm-note');

let current = 'length';

function fillSelect(select, units, selected) {
  select.innerHTML = '';
  for (const [key, unit] of Object.entries(units)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${unit.name} (${unit.symbol})`;
    select.appendChild(option);
  }
  select.value = selected;
}

function selectCategory(category) {
  current = category;

  tabs.forEach(tab => {
    const active = tab.dataset.category === category;
    tab.setAttribute('aria-selected', active);
    tab.tabIndex = active ? 0 : -1;
    if (active) {
      // Keep the active tab visible in the tab strip without scrolling the page
      const strip = tab.parentElement;
      strip.scrollLeft = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
    }
  });

  // Ohm's law is a calculator, not a unit category, so it has its own panel
  const isOhm = category === 'ohm';
  panel.hidden = isOhm;
  ohmPanel.hidden = !isOhm;
  if (isOhm) {
    updateOhm();
    return;
  }

  const { units, defaults } = CATEGORIES[category];
  fillSelect(fromSelect, units, defaults[0]);
  fillSelect(toSelect, units, defaults[1]);
  categoryName.textContent = category;
  update();
}

// I = V / R, P = V × I
function updateOhm() {
  const read = input => (input.value.trim() === '' ? NaN : Number(input.value));
  const voltage = read(voltageInput);
  const resistance = read(resistanceInput);

  if (Number.isNaN(voltage) || Number.isNaN(resistance)) {
    currentOutput.textContent = '—';
    powerOutput.textContent = '—';
    ohmNote.textContent = 'Enter a voltage and a resistance.';
    return;
  }

  if (resistance <= 0) {
    currentOutput.textContent = '—';
    powerOutput.textContent = '—';
    ohmNote.textContent = 'Resistance must be greater than 0 Ω.';
    return;
  }

  const amps = voltage / resistance;
  currentOutput.textContent = `${format(amps)} A`;
  powerOutput.textContent = `${format(voltage * amps)} W`;
  ohmNote.textContent = 'I = V / R  ·  P = V × I';
}

function update() {
  const { units } = CATEGORIES[current];
  const from = units[fromSelect.value];
  const to = units[toSelect.value];
  const value = valueInput.value.trim() === '' ? NaN : Number(valueInput.value);

  resultOutput.textContent = format(convert(value, from, to));

  if (current === 'temperature') {
    formulaLine.textContent = '';
  } else {
    formulaLine.textContent = `1 ${from.symbol} = ${format(convert(1, from, to))} ${to.symbol}`;
  }

  allUnitsList.innerHTML = '';
  for (const unit of Object.values(units)) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const amount = document.createElement('span');
    name.className = 'unit-name';
    amount.className = 'unit-value';
    name.textContent = unit.name;
    amount.textContent = `${format(convert(value, from, unit))} ${unit.symbol}`;
    item.append(name, amount);
    allUnitsList.appendChild(item);
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCategory(tab.dataset.category));

  // Arrow keys move between tabs
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    next.focus();
    selectCategory(next.dataset.category);
  });
});

valueInput.addEventListener('input', update);
fromSelect.addEventListener('change', update);
toSelect.addEventListener('change', update);
voltageInput.addEventListener('input', updateOhm);
resistanceInput.addEventListener('input', updateOhm);

swapButton.addEventListener('click', () => {
  [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
  update();
});

// ---------- Theme ----------
// A saved choice lives in data-theme on <html> (set early by the script in index.html).
// With no saved choice the CSS follows the system setting.

const THEME_KEY = 'convertlab-theme';
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function activeTheme() {
  return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
}

function labelThemeToggle() {
  const label = activeTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

themeToggle.addEventListener('click', () => {
  const next = activeTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {
    // Storage blocked (e.g. private mode): the theme still switches, it just isn't remembered
  }
  labelThemeToggle();
});

systemDark.addEventListener('change', labelThemeToggle);
labelThemeToggle();

document.getElementById('year').textContent = new Date().getFullYear();

selectCategory('length');
