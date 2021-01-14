class Effect {
  constructor(name, onsetMonth, activeMonth, completingMonth, endMonth) {
    this.name = name;
    this.onsetMonth = onsetMonth;
    this.activeMonth = activeMonth;
    this.completingMonth = completingMonth;
    this.endMonth = endMonth;
  }
}

Effect.basic = (name, startMonth, endMonth) => {
  return new Effect(name, startMonth, startMonth, endMonth, endMonth);
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EFFECTS = [
  new Effect('Fat Redistribution', 3, 6, 24, 60),
  new Effect('Reduced Muscle', 3, 6, 12, 24),
  new Effect('Softer Skin', 3, 6, 12, 60),
  new Effect('Lower Libido', 1, 3, 12, 24),
  new Effect('Reduced Erections', 1, 3, 3, 6),
  new Effect('Breast Growth', 3, 6, 24, 36),
  new Effect('Testicle Shrinking', 3, 6, 24, 36),
  new Effect('Body Hair Thinning', 6, 12, 36, 60),
];

const Colors = {
  ONSET: '#6da9df',
  ACTIVE: '#35771f',
  COMPLETING: '#a64d79',
};

const lerp = (a, b, s) => {
  return (1.0 - s) * a + s * b;
};

const lerpAB = (a, A, b, B, s) => {
  return lerp(A, B, (1.0 * s - a) / (b - a));
};

const getDateStamp = date => {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${(date.getDate()+1).toString().padStart(2, '0')}`;
};

const getStartDate = () => {
  try {
    const d = Date.parse($('#start-date').val());
    if (typeof d !== 'number' || Number.isNaN(d)) {
      return new Date().getDate();
    }
    const str = getDateStamp(new Date(d));
    if (window.location.hash !== str) {
      window.location.hash = `${str}`;
    }
    return d;
  } catch (e) {

    console.log(e);
    return new Date().getDate();
  }
};

const renderChart = () => {
  const canvas = document.getElementById('canvas');
  const g = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const padding = {
    left: 25,
    right: 0,
    top: 50,
    bottom: 0,
  };

  g.lineWidth = 1.0;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, width + 1, height + 1);

  const labelSize = 14;
  const legendSize = 10;

  const legend = [
    { name: 'Onset', color: Colors.ONSET },
    { name: 'Changes Occurring', color: Colors.ACTIVE },
    { name: 'Completion', color: Colors.COMPLETING },
  ];

  g.font = `${legendSize}px sans-serif`;
  padding.right = legend
    .map(e => e.name)
    .map(n => g.measureText(n).width)
    .reduce((a, b) => a > b ? a : b) + legendSize + 50;

  g.font = `${labelSize}px sans-serif`;
  g.fillStyle = '#444444';

  const maxLabelWidth = EFFECTS
    .map(effect => effect.name)
    .map(name => g.measureText(name).width)
    .reduce((a, b) => a > b ? a : b);

  const leftLine = padding.left + maxLabelWidth + 10;

  const effectVerticals = [];

  let y = padding.top + labelSize;
  for (effect of EFFECTS) {
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillText(effect.name, padding.left + maxLabelWidth - g.measureText(effect.name).width, y);
    effectVerticals.push(y);
    y += labelSize*2;
  }

  padding.bottom = height - y;

  const startDate = getStartDate();
  const now = new Date();
  const currentMonth = (now - startDate) / (1000 * 60 * 60 * 24 * 30.0);

  const maxEffectMonth = EFFECTS
    .map(effect => effect.endMonth)
    .reduce((a, b) => a > b ? a : b);

  const monthX = i => lerpAB(0, leftLine, maxEffectMonth, width - padding.right, i);

  const fillMonth = (vertical, startMonth, endMonth) => {
    if (startMonth == endMonth) {
      return;
    }
    g.fillRect(monthX(startMonth), vertical, monthX(endMonth) - monthX(startMonth), labelSize);
  };

  const fillMonthText = (vertical, startMonth, endMonth) => {
    if (startMonth == endMonth) {
      return;
    }
    if (currentMonth < startMonth) {
      return;
    }
    g.font = `${labelSize-6}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    const percent = Math.round(100 * Math.max(0, Math.min(1, (1.0 * currentMonth - startMonth) / (endMonth - startMonth))));
    g.fillText(`${percent}%`, monthX((startMonth + endMonth)/2.0), vertical + labelSize/2.0);
  };

  const strokeMonthLine = i => {
    g.beginPath();
    g.moveTo(monthX(i), padding.top);
    g.lineTo(monthX(i), height - padding.bottom);
    g.stroke();
  };

  for (let i = 1; i <= maxEffectMonth; i++) {
    g.strokeStyle = '#aaaaaa';
    strokeMonthLine(i);
  }

  g.strokeStyle = '#ff78cb';
  g.lineWidth = 2;
  strokeMonthLine(currentMonth);
  g.lineWidth = 1;

  for (const i in EFFECTS) {
    const effect = EFFECTS[i];
    const y = effectVerticals[i];

    g.fillStyle = Colors.ONSET;
    fillMonth(y, effect.onsetMonth, effect.activeMonth);

    g.fillStyle = Colors.ACTIVE;
    fillMonth(y, effect.activeMonth, effect.completingMonth);

    g.fillStyle = Colors.COMPLETING;
    fillMonth(y, effect.completingMonth, effect.endMonth);
  }

  for (const i in EFFECTS) {
    const effect = EFFECTS[i];
    const y = effectVerticals[i];

    g.fillStyle = '#ffffff';
    fillMonthText(y, effect.onsetMonth, effect.activeMonth);
    fillMonthText(y, effect.activeMonth, effect.completingMonth);
    fillMonthText(y, effect.completingMonth, effect.endMonth);
  }

  g.strokeStyle = '#000000';
  strokeMonthLine(0);

  g.fillStyle = '#000000';
  g.textAlign = 'center';
  g.textBaseline = 'top';
  for (let i = 0; i <= maxEffectMonth; i += 6) {
    const x = monthX(i);
    g.font = `12px sans-serif`;
    g.fillText(`${i}`, x, height - padding.bottom + 5);

    const date = new Date(startDate + i * 30 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = MONTHS[date.getMonth()].substring(0, 3);

    g.font = `10px sans-serif`;
    g.fillText(`${month} ${year}`, x, height - padding.bottom + 5 + 12 + 5);
  }

  for (const i in legend) {
    const entry = legend[i];
    const y = padding.top + (legendSize + 10) * i;
    const x = width - padding.right + 10;

    g.fillStyle = entry.color;
    g.fillRect(x, y, legendSize, legendSize);

    g.strokeStyle = '#000000';
    g.lineWidth = 0.3;
    g.strokeRect(x, y, legendSize, legendSize);

    g.fillStyle = '#000000';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.font = `${legendSize}px sans-serif`;
    g.fillText(entry.name, x + legendSize + 5, y + legendSize/2+1);
  }

  g.fillStyle = '#000000';
  g.textAlign = 'left';
  g.textBaseline = 'bottom';
  g.font = '20px sans-serif';
  g.fillText('MtF HRT Effects Timeline', leftLine, padding.top - 10);


  g.fillStyle = '#888888';
  g.textAlign = 'middle';
  g.textBaseline = 'bottom';
  g.font = 'italic 16px sans-serif';
  g.fillText(`(HRT start date ${getDateStamp(new Date(startDate))})`, (padding.left + width - padding.right)/2, padding.top - 10);

  const newHeight = height - padding.bottom + 50;
  if (height != newHeight) {
    canvas.height = newHeight;
    setTimeout(renderChart, 10);
  }
};

$(document).ready(() => {
  const hash = window.location.hash;
  if (hash.length > 1) {
    $('#start-date').val(hash.substring(1));
  }
  renderChart();
  setInterval(renderChart, 100);
});
