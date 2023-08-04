const SVG = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const STAT_NAMES = [
  'Anxiety',
  'Autism',
  'Depression',
  'Dissociation',
  'Psychosis',
];
const INITIAL_STATS = new Array(5).fill(1);

const pentapoints = (radius) => {
  const radii = typeof radius === 'number' ? new Array(5).fill(radius) : radius;
  return new Array(5).fill(0).map((_, i) => i/5.0).map((s, i) => ({
    x: Math.cos(s * TAU - TAU/4) * radii[i],
    y: Math.sin(s * TAU - TAU/4) * radii[i],
  })).map(({x, y}) => ({x: Math.round(x), y: Math.floor(y)})).map((p, i) => (
    i == 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
  )).join(' ') + ' Z';
};

const mkPentagon = (radius) => {
  const path = document.createElementNS(SVG, 'path');
  path.setAttributeNS(null, 'fill', 'rgba(128, 128, 128, 0.2)');
  path.setAttributeNS(null, 'd', pentapoints(radius));
  return path;
};

const mkStatagon = (radius, stats) => {
  const p = mkPentagon(radius/5);
  p.setAttributeNS(null, 'fill', '#0088ff88');
  p.setAttributeNS(null, 'style', [
    'transition: d 0.25s ease-in;',
  ].join(' '));
  setTimeout(() => {
    p.setAttributeNS(null, 'd', pentapoints(stats.map(a => a/5 * radius)));
  }, 10);
  return p;
};

const mkLabel = (radius, index, label) => {
  const angle = index/5 * TAU - TAU / 4;
  const alignment = [
    { anchor: 'middle', baseline: 'middle' },
    { anchor: 'middle', baseline: 'middle' },
    { anchor: 'middle', baseline: 'text-after-edge' },
    { anchor: 'middle', baseline: 'text-after-edge' },
    { anchor: 'middle', baseline: 'middle' },
  ][index];
  const text = document.createElementNS(SVG, 'text');
  text.setAttributeNS(null, 'text-anchor', alignment.anchor);
  text.setAttributeNS(null, 'dominant-baseline', alignment.baseline);
  text.setAttributeNS(null, 'x', (radius * Math.cos(angle)).toString());
  text.setAttributeNS(null, 'y', (radius * Math.sin(angle)).toString());
  text.setAttributeNS(null, 'fill', 'rgb(0, 128, 255)');
  text.setAttributeNS(null, 'font-family', 'Liberation Mono, Consolas, monospace');
  text.innerHTML = label;
  return text;
};

const mkInputs = (updateName, updateStat) => {
  const container = document.getElementById('stats');
  STAT_NAMES.forEach((name, i) => {
    const stack = document.createElement('div');
    stack.setAttribute('class', 'stat');

    const actions = {
      editName: () => {},
      saveName: () => {},
    };

    const nameInput = document.createElement('input');
    const nameLink = document.createElement('a');

    nameInput.setAttribute('value', name);
    nameInput.onchange = e => {
      const name = e.target.value;
      updateName(i, `${name}`.trim());
      nameLink.innerHTML = name;
    };
    nameInput.onblur = () => actions.saveName();
    nameInput.setAttribute('style', 'display: none;');
    stack.append(nameInput);

    nameLink.setAttribute('href', '#');
    nameLink.innerHTML = name;
    nameLink.setAttribute('tabindex', -1);
    nameLink.setAttribute('notab', 'notab');
    nameLink.onclick = () => {
      actions.editName();
    };
    stack.append(nameLink);

    actions.editName = () => {
      nameLink.setAttribute('style', 'display: none;');
      nameInput.setAttribute('style', '');
      setTimeout(() => nameInput.focus(), 10);
    };

    actions.saveName = () => {
      nameInput.setAttribute('style', 'display: none;');
      nameLink.setAttribute('style', '');
    };

    const statInput = document.createElement('input');
    statInput.setAttribute('value', INITIAL_STATS[i]);
    statInput.onchange = e => {
      const stat = `${e.target.value}`.trim();
      if (stat >= 1 && stat <= 5) {
        updateStat(i, Math.floor(stat));
      }
    };
    statInput.onkeyup = statInput.onchange;
    statInput.onblur = statInput.onchange;
    
    stack.append(statInput);

    container.append(stack);
  });
};

const setup = () => {
  const svg = document.getElementById('chart');
  const [w, h] = [svg.clientWidth, svg.clientHeight];
  const side = Math.min(w, h);

  const radius = side/2 - 100;
  const levels = 5;

  const translate = document.createElementNS(SVG, 'g');
  translate.setAttributeNS(null, 'transform', `translate(${w/2} ${h/2})`);
  svg.append(translate);

  new Array(levels).fill(0).map((_, i) => i).forEach(i => {
    translate.append(mkPentagon((levels - i)/levels * radius));
  });

  const stats = INITIAL_STATS.map(x => x);
  const statagon = mkStatagon(radius, stats);
  translate.append(statagon);

  const labels = STAT_NAMES.map((name, i) => {
    const label = mkLabel(radius + 40, i, name);
    label.setAttributeNS(null, 'fill', 'black');
    translate.append(label);

    const number = mkLabel(radius + 40, i, stats[i].toString());
    number.setAttributeNS(null, 'y', Math.floor(number.getAttributeNS(null, 'y')) + 25);
    translate.append(number);

    return { label, stat: number };
  });

  const updateName = (stat, value) => {
    STAT_NAMES[stat] = value;
    labels[stat].label.innerHTML = value;
  };

  const updateStat = (stat, value) => {
    stats[stat] = value;
    labels[stat].stat.innerHTML = value;
    statagon.setAttributeNS(null, 'd', pentapoints(stats.map(s => s / 5 * radius)));
  };

  mkInputs(updateName, updateStat);
};

setTimeout(setup, 1);

