const dsmv = {
  free: '',
  tiles: {
    'Autism Spectrum Disorder': [],
    'Attention-Deficit/ Hyperactivity Disorder': [],
    "Tourette's Disorder": [],
    'Schizotypal Personality Disorder': [],
    'Delusional Disorder': [],
    'Brief Psychotic Disorder': [],
    'Schizophreniform Disorder': [],
    'Schizophrenia': [],
    'Schizoaffective Disorder': [],
    'Bipolar I Disorder': [],
    'Bipolar II Disorder': [],
    'Cyclothymic Disorder': [],
    'Disruptive Mood Dysregulation Disorder': [],
    'Major Depressive Disorder': [],
    'Premenstrual Dysphoric Disorder': [],
    'Seperation Anxiety Disorder': [],
    'Selective Mutism': [],
    'Specific Phobia': [],
    'Social Anxiety Disorder': [],
    'Panic Disorder': [],
    'Agoraphobia': [],
    'Generalized Anxiety Disorder': [],
    'Obsessive-Compulsive Disorder': [],
    'Body Dysmorphic Disorder': [],
    'Hoarding Disorder': [],
    'Trichotillomania': [],
    'Excoriation Disorder': [],
    'Reactive Attachment Disorder': [],
    'Posttraumatic Stress Disorder': ['incl. cPTSD'],
    'Acute Stress Disorder': [],
    'Adjustment Disorder': [],
    'Dissociative Identity Disorder': [],
    'Dissociative Amnesia': [],
    'Depersonalization/ Derealization Disorder': [],
    'Otherwise Specified Dissociative Disorder': [],
    'Somatic Symptom Disorder': [],
    'Illness Anxiety Disorder': [],
    'Conversion Disorder': [],
    'Factitious Disorder': [],
    'Pica': [],
    'Rumination Disorder': [],
    'Avoidant/Restrictive Food Intake Disorder': [],
    'Anorexia Nervosa': [],
    'Bulimia Nervosa': [],
    'Binge-Eating Disorder': [],
    'Enuresis': [],
    'Encopresis': [],
    'Insomnia Disorder': [],
    'Hypersomnolence Disorder': [],
    'Narcolepsy': [],
    'Circadian Rhythm Sleep-Wake Disorder': [],
    'Non-REM Sleep Arousal Disorder': [],
    'Nightmare Disorder': [],
    'REM Sleep Behavior Disorder': [],
    'Restless Legs Syndrome': [],
    'Sexual Dysfunction': [],
    'Gender Dysphoria': [],
    'Oppositional Defiant Disorder': [],
    'Intermittent Explosive Disorder': [],
    'Conduct Disorder': [],
    'Antisocial Personality Disorder': [],
    'Pyromania': [],
    'Kleptomania': [],
    'Substance Abuse': [],
    'Dilirium': [],
    'Paranoid Personality Disorder': [],
    'Schizoid Personality Disorder': [],
    'Schizotypal Personality Disorder': [],
    'Antisocial Personality Disorder': [],
    'Borderline Personality Disorder': [],
    'Histrionic Personality Disorder': [],
    'Narcissistic Personality Disorder': [],
    'Avoidant Personality Disorder': [],
    'Dependent Personality Disorder': [],
    'Obsessive-Compulsive Personality Disorder': [],
  },
  instructions: `
    Select all squares you've been diagnosed with (self-diagnoses valid). Past diagnoses & misdiagnoses count if you want them to (you earned them)! Note that there are far more diagnoses than can fit in a single board; each time you will get a random subset.
  `,
};

const diagnoses = {
  free: '',
  tiles: {
    'Anxiety Disorders': ['GAD', 'SAD', 'Panic Disorder', 'Phobias', '...'],
    'Bipolar Disorders': ['Bipolar I', 'Bipolar II', 'Cyclothymic'],
    'Breathing-Related Disorders': ['Sleep Apnea', '...'],
    'Cluster-A Personality Disorders': ['Paranoid', 'Schizoid', 'Schizotypal'],
    'Cluster-B Personality Disorders': ['Antisocial', 'Borderline', 'Histronic', 'Narcissistic'],
    'Cluster-C Personality Disorders': ['Avoidant', 'Dependent', 'Obsessive-Compulsive'],
    'Depressive Disorders': ['MDD', 'Premenstrual Dysphoric Disorder', '...'],
    'Developmental Disorders': ['Language Disorders', 'Motor Disorders', '...'],
    'Disruptive/ Impulse-Control Disorders': ['Oppositional Defiant', 'Antisocial Personality', '...'],
    'Dissociative Disorders': ['DID', 'Amnesia', 'Derealization/ Depersonalization', 'OSDD'],
    'Elimination Disorders': ['Enuresis', 'Encopresis', '...'],
    'Eating Disorders': ['Pica', 'Anorexia', 'Bulimia', '...'],
    'Gender Dysphoria': [],
    'Neurocognitive Disorders': ['Delirium', '...'],
    'Autism or ADHD': ['Autism Spectrum', 'ADHD'],
    'Obsessive-Compulsive Disorders': ['OCD', 'Trichotillomanmia', 'Skin-Picking', 'Hoarding', '...'],
    'Paraphilic Disorders': [],
    'Parasomnias': ['REM Sleep Behavior Disorder', 'Restless Legs Syndrome', '...'],
    'Schizophrenia Spectrum': ['psychotic disorders'],
    'Sexual Dysfunctions': [],
    'Sleep-Wake Disorders': ['Insomnia', 'Hypersomnolence', 'Narcolepsy', '...'],
    'Somatic Symptom Disorders': ['Somatic Symptom Disorder', 'Illness Anxiety Disorder', 'Conversion Disorder', 'Factitious Disorder', '...'],
    'Substance and Addictive Disorders': [],
    'Trauma and Stressor Disorders': ['PTSD', 'cPTSD', 'Acute Stress', 'Adjustment', '...'],
  },
  instructions: `
    Select all squares you've been diagnosed with (self-diagnoses valid). Past diagnoses & misdiagnoses count if you want them to (you earned them)!\nNote that the personality disorders as well as Autism/ADHD were expanded out to ensure there were enough tiles.
  `,
};

const symptoms = {
  free: '',
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
    'Executive Dysfunction': [],
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
    'Tics': [],
    'Time-Blindness': [],
    'Tremors': [],
    'Unalive Ideation': [],
    'Unstable Identity': [],
    'Visual Hallucinations': [],
  },
  instructions: 'Select all you have experienced. Note that even while not pulling from a comprehensive list, there are far more than can fit in a single board; you will get a different random subset each time.',
};

// static ordering for CSS crime version
const staticCategories = [
    'Bipolar Disorders',
    'Breathing-Related Disorders',
    'Cluster-A Personality Disorders',
    'Depressive Disorders',
    'Disruptive/ Impulse-Control Disorders',
    'Neurocognitive Disorders',
    'Anxiety Disorders',
    'Elimination Disorders',
    'Dissociative Disorders',
    'Cluster-C Personality Disorders',
    'Eating Disorders',
    'Gender Dysphoria',
    'Parasomnias',
    'Sexual Dysfunctions',
    'Developmental Disorders',
    'Autism or ADHD',
    'Somatic Symptom Disorders',
    'Sleep-Wake Disorders',
    'Schizophrenia Spectrum',
    'Cluster-B Personality Disorders',
    'Obsessive-Compulsive Disorders',
    'Paraphilic Disorders',
    'Trauma and Stressor Disorders',
    'Substance and Addictive Disorders',
];

const configOptions = {
  'DSM-V Categories': diagnoses,
  'Symptoms': symptoms,
  'DSM-V Diagnoses': dsmv,
};

const getConfig = () => {
  if (window.location.hash.indexOf('css-crime') >= 0) {
    return {
      ...configOptions['DSM-V Categories'],
      ordering: staticCategories,
      isCrime: true,
    };
  }
  const defaultChoice = 'Symptoms';
  const hash = window.location.hash.replace(/%20/g, ' ');
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

if (config.isCrime) {
  controls.removeAttribute('class');
  controls.setAttribute('style', `
    margin-top: -0.5em;
    margin-bottom: 0.5em;
  `);
  controls.innerHTML = `
    <a href="https://gwenscode.com/ndbingo#DSM-V Categories">Randomized Cards</a>
  `;
} else {
  const randomOptions = Object.keys(configOptions);
  randomOptions.sort();
  randomOptions.forEach(opt => {
    const a = document.createElement('a');
    a.setAttribute('href', `javascript:randomize('${opt}')`);
    a.innerHTML = `Random <i>${opt}</i> Board`;
    controls.appendChild(a);
  });
}

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

const tileElements = Array.from(document.getElementsByClassName('tile'));

const createTile = () => {
  const div = document.createElement('div');
  div.setAttribute('class', 'tile'); 
  return div;
};

const grid = document.getElementsByClassName('bingo-grid')[0];
while (tileElements.length < 25) {
  const tile = createTile();
  grid.appendChild(tile);
  tileElements.push(tile);
}

const criminalizeTile = (old) => {
  const tile = document.createElement('div');
  const inner = old.innerHTML
    .replace(/class="first-letter"/g, 'style="font-weight: bold;"')
    .replace(/class="word"/g, `style="
      word-wrap: anywhere;
      margin-left: 0.5em;
    "`)
    .replace(/class="free-text"/g, `style="
      font-weight: bold;
      font-size: 1.2rem;
      margin: 0.5ex;
    "`);
  tile.setAttribute('style', `
    position: relative;
    aspect-ratio: 1/1;
  `);

  const details = document.createElement('details');
  tile.appendChild(details);
  details.setAttribute('style', `
  `);

  const isFree = inner.indexOf('FREE') >= 0;

  const basicTileStyle = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    aspect-ratio: 1/1;
    border: thin solid hsl(0, 0%, 75%);
    font-family: sans-serif;
    font-size: 0.9em;
    padding: 0.5em;
    cursor: ${isFree ? 'default' : 'pointer'};
    user-select: none;
  `;

  const freeBgColor = 'hsl(30, 100%, 80%)';
  const plainBgColor = isFree ? freeBgColor : 'hsl(0, 0%, 98%)'; 
  const selectedBgColor = isFree ? freeBgColor : 'hsl(200, 100%, 80%)'; 

  const summary = document.createElement('summary');
  details.appendChild(summary);
  summary.setAttribute('style', `
    ${basicTileStyle}
    background: ${plainBgColor};
    list-style: none;
  `);
  summary.innerHTML = inner;

  const selected = document.createElement('div');
  details.appendChild(selected);
  selected.setAttribute('style', `
    ${basicTileStyle}
    background: ${selectedBgColor};
    list-style: none;
    pointer-events: none;
  `);
  selected.innerHTML = inner;

  const specifics = Array.from(selected.getElementsByClassName('specifics'))
    .map(s => s.innerHTML
      .replace(/<.*?>/gms, '')
    )
    .join(' ');
  console.log(specifics);

  selected.setAttribute('title', specifics);
  tile.setAttribute('title', specifics);

  for (const sp of selected.getElementsByClassName('specifics')) {
    sp.parentNode.removeChild(sp);
  }
  for (const sp of tile.getElementsByClassName('specifics')) {
    sp.parentNode.removeChild(sp);
  }

  old.parentNode.replaceChild(tile, old);
  return tile;
};

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
  const alreadyWired = el.innerHTML.trim().length > 0;
  el.innerHTML = '';

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
  } else if (!alreadyWired) {
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

const criminalize = () => {
  Array.from(document.getElementsByClassName('tile'))
    .forEach(criminalizeTile);

  for (const e of document.getElementsByClassName('subtitle')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      font-size: 0.8em;
      margin-bottom: 2ex;
      max-width: 60vw;
    `);
  }

  for (const e of document.getElementsByClassName('title')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      font-family: sans-serif;
      font-weight: bold;
      font-size: 4em;
      margin-top: -0.5rem;
    `);
  }

  for (const e of document.getElementsByClassName('bingo-variant')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      font-family: serif;
      font-weight: bold;
      font-size: 2em;
    `);
  }

  for (const e of document.getElementsByClassName('bingo-card')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      display: flex;
      background: white;
      flex-direction: column;
      align-items: center;
      align-content: stretch;
      text-align: center;
      color: #444;
      max-height: 100vh;
      overflow: hidden;
    `);
  }

  for (const e of document.getElementsByClassName('bingo-grid')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      flex-grow: 1;
      flex-shrink: 1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(5, 1fr);
      grid-gap: 1em;
      overflow: hidden;
      width: 100%;
      justify-content: center;
      padding-bottom: 10ex;
    `);
  }

  for (const e of document.getElementsByClassName('spacer')) {
    e.removeAttribute('class');
    e.setAttribute('style', `
      flex-grow: 1;
      flex-shrink: 1;
    `);
  }
};

const getOrderedTiles = () => {
  if (config.ordering) {
    return config.ordering;
  }
  const pool = Object.keys(config.tiles);
  const ordering = [];
  while (pool.length > 0) {
    const index = Math.floor(pool.length * Math.random());
    ordering.push(pool[index]);
    pool.splice(index, 1);
  }
  return ordering;
};

const setupBoard = () => {
  const ordering = getOrderedTiles();
  for (let i = 0; i < tileElements.length && ordering.length > 0; i++) {
    if (i === 12) {
      setupTile(freeSpace, tileElements[i]);
      continue;
    }
    const spice = ordering[0];
    ordering.splice(0, 1);
    if (spice === freeSpace) {
      continue;
    }
    setupTile(spice, tileElements[i]);
  }

  if (config.isCrime) {
    criminalize();
  }
};

setupBoard();
