const spices = {
  'ADHD': [],
  'Cluster-A Personality Disorder': ['Paranoid', 'Schizoid', 'Schizotypal'],
  'Cluster-B Personality Disorder': ['Antisocial', 'Borderline', 'Histronic', 'Narcissistic'],
  'Cluster-C Personality Disorder': ['Avoidant', 'Dependent', 'Obsessive-Compulsive'],
  'Bipolar': ['Bipolar I', 'Bipolar II', 'Cyclothymic'],
  'Body-Dysmorphic Disorder': [],
  'Conduct Disorder': [],
  'DID/OSDD': [],
  'Depersonalization/ Derealization Disorder': [],
  'Dissociative Amnesia': [],
  'Eating Disorder': ['Anorexia Nervosa', 'Bulimia Nervosa', 'Pica', '...'],
  'Gender Dysphoria': [],
  'Generalized Anxiety Disorder': [],
  'Sleep-Wake Disorder': ['Insomnia', 'Narcolepsy', 'Nightmare', '...'],
  'Major Depressive Disorder': [],
  'Obsessive-Compulsive Disorder': [],
  'Panic Disorder': [],
  'Seasonal Affective Disorder': [],
  'Social Anxiety Disorder': [],
  'Somatic Symptom': ['Illness Anxiety', '...'],
  'Substance/ Addictive Disorder': [],
  'Trauma Disorder': ['PTSD', 'cPTSD', 'Acute Stress', '...',],
  'Picking Disorder': ['Trichotillomania', 'Skin-Picking', '...'],
  'Schizophrenia': ['and other psychotic disorders'],
}

const freeSpace = 'Autism Spectrum';
const letterPattern = /[a-zA-Z]/;

const renderWords = (text, el) => {
  const element = typeof el === 'undefined' ? document.createElement('div') : el;
  let inWord = false;
  let inSymbol = false;

  const mktoken = () => {
    const w = document.createElement('div');
    w.setAttribute('class', 'word');
    return w;
  };

  let token = mktoken();
  element.appendChild(token);

  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const isLetter = !!c.match(letterPattern);

    if (c === ' ') {
      token = mktoken();
      element.appendChild(token);
    }

    if (isLetter && !inWord) {
      const first = document.createElement('span');
      first.setAttribute('class', 'first-letter');
      first.innerHTML = c;
      token.appendChild(first);
    } else {
      token.innerHTML += c;
    }
    
    inWord = isLetter;
    inSymbol = !isLetter;
  }

  return element;
};

const tileElements = document.getElementsByClassName('tile');

const isSelected = (tile) => {
  const k = tile.getAttribute('class');
  return k.indexOf('selected') >= 0 || k.indexOf('free') >= 0;
};

const checkWins = () => {
  const index = (r, c) => r*5 + c;
  const get = (r, c) => tileElements[index(r,c)];
  const range = Array(5).fill(0).map((_,i) => i);

  const wins = new Set();

  // horizontal
  for (let r = 0; r < 5; r++) {
    if (range.every(c => isSelected(get(r,c)))) {
      range.forEach(c => wins.add(index(r,c)));
    }
  }
  // vertical
  for (let c = 0; c < 5; c++) {
    if (range.every(r => isSelected(get(r,c)))) {
      range.forEach(r => wins.add(index(r,c)));
    }
  }
  // diagonals
  if (range.every(i => isSelected(get(i, i)))) {
    range.forEach(i => wins.add(index(i, i)));
  }
  if (range.every(i => isSelected(get(i, 5-i-1)))) {
    range.forEach(i => wins.add(index(i, 5-i-1)));
  }

  for (let i = 0; i < tileElements.length; i++) {
    const e = tileElements[i];
    const k = e.getAttribute('class').replace(/ win\b/g, '');
    if (wins.has(i)) {
      e.setAttribute('class', `${k} win`); 
    } else {
      e.setAttribute('class', k);
    }
  }
};

const setupTile = (spice, el) => {
  renderWords(spice, el);

  const list = spices[spice];

  if (list && list.length > 0) {
    const specifics = document.createElement('div');
    specifics.setAttribute('class', 'specifics');
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        specifics.innerHTML += ', ';
      }
      renderWords(list[i], specifics);
    }
    el.appendChild(specifics);
  }

  if (spice === freeSpace) {
    el.appendChild(createFree());
    el.setAttribute('class', 'tile free');
  } else {
    el.addEventListener('click', () => {
      if (el.getAttribute('class').indexOf('selected') >= 0) {
        el.setAttribute('class', 'tile');
      } else {
        el.setAttribute('class', 'tile selected');
      }
      checkWins();
    });
  }
};

const createFree = () => {
  const e = document.createElement('div');
  e.setAttribute('class', 'free-text');
  e.innerHTML = '★ FREE ★';
  return e;
};

const spicePool = Object.keys(spices);
for (let i = 0; i < tileElements.length && spicePool.length > 0; i++) {
  if (i === 12) {
    setupTile(freeSpace, tileElements[i]);
    continue;
  }
  const spiceIndex = Math.floor(spicePool.length * Math.random());
  const spice = spicePool[spiceIndex];
  spicePool.splice(spiceIndex, 1); // remove
  setupTile(spice, tileElements[i]);
}

