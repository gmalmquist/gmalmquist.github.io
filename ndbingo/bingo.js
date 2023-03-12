const diagnoses = {
  free: 'Autism Spectrum',
  tiles: {
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
    'Somatic Symptom Disorder': ['Illness Anxiety', '...'],
    'Substance/ Addictive Disorder': [],
    'Trauma Disorder': ['PTSD', 'cPTSD', 'Acute Stress', '...',],
    'Picking Disorder': ['Trichotillomania', 'Skin-Picking', '...'],
    'Schizophrenia': ['and other psychotic disorders'],
  },
  instructions: `
    Select all squares you've been diagnosed with (self-diagnoses valid). Past diagnoses & misdiagnoses count if you want them to (you earned them)!
  `,
};

const symptoms = {
  free: 'Executive Dysfunction',
  tiles: {
    'Agoraphobia': [],
    'Amnesia': [],
    'Anger Issues': [],
    'Anorexia': [],
    'Anxious Attachment': [],
    'Auditory Hallucinations': [],
    'Avoidant Attachment': [],
    'Binge Eating': [],
    'Brain Fog': [],
    'Catastrophizing': [],
    'Chronic Overwork': [],
    'Compulsions': [],
    'Compulsive Lying': [],
    'Delusions of Grandeur': [],
    'Depersonalization/ Derealization': [],
    'Depressive Episodes': [],
    'Disorganized Thinking': [],
    'Dissociation': [],
    'Distractibility': [],
    'Dysmorphia': [],
    'Fatigue': [],
    'Fear of Abandonment': [],
    'Flashbacks': [],
    'Food-Related Anxiety': [],
    'General Anxiety': [],
    'Heart Palpitations': [],
    'Hyperfocus': [],
    'Hypersexuality': [],
    'Illness Anxiety': [],
    'Impaired Motor Function': [],
    'Increased Need for Sleep': [],
    'Insomnia': [],
    'Kleptomania': [],
    'Manic/ Hypomanic Episodes': [],
    'Mood Swings': [],
    'Narcolepsy': [],
    'Night Terrors': [],
    'Nightmares': [],
    'Overspending': [],
    'Overstimulation': [],
    'Panic Attacks': [],
    'Paranoia': [],
    'People Pleasing': [],
    'Perfectionism': [],
    'Pressured Speech': [],
    'Psychomotor Agitation': [],
    'Psychosis': [],
    'Racing Thoughts': [],
    'Reckless Driving': [],
    'Reduced Need for Sleep': [],
    'Rejection Sensitivity': [],
    'Seizures': [],
    'Self-Harm': [],
    'Sexual Dysfunction': [],
    'Sleep Paralysis': [],
    'Social Anxiety': [],
    'Specific Phobias': [],
    'Splitting': ['(in either sense)'],
    'Stimming': [],
    'Substance Abuse': [],
    'Tactile Hallucinations': [],
    'Time-Blindness': [],
    'Unalive Ideation': [],
    'Unstable Identity': [],
    'Visual Hallucinations': [],
  },
  instructions: 'Select all you have experienced.',
};

const configOptions = {
  diagnoses,
  symptoms
};

const getConfig = () => {
  const defaultChoice = 'symptoms';
  const hash = window.location.hash;
  if (hash.length === 0) return configOptions[defaultChoice];
  return configOptions[hash.substring(1)] || configOptions[defaultChoice];
};

const config = getConfig();
const spices = config.tiles;
const freeSpace = config.free;
const letterPattern = /[a-zA-Z]/;

const subtitles = document
  .getElementsByClassName('subtitle')[0]
  .innerHTML = config.instructions;

const randomize = (kind) => {
  window.location.hash = `#${kind}`;
  window.location.reload();
};

const controls = document
  .getElementsByClassName('controls')[0];
controls.innerHTML = '';
const randomOptions = Object.keys(configOptions);
randomOptions.sort();
randomOptions.forEach(opt => {
  const a = document.createElement('a');
  a.setAttribute('href', `javascript:randomize('${opt}')`);
  a.innerHTML = `random ${opt} board`;
  controls.appendChild(a);
});

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

