setTimeout(() => {
  // read cookie
  const cookies = decodeURIComponent(document.cookie);
  const textbox = Array.from(document.getElementsByClassName('spellnames'))[0];
  const cardSize = Array.from(document.getElementsByName("card-size"))[0];
  const map = new Map();
  for (const cookie of cookies.split(";")) {
    const eq = cookie.indexOf('=');
    if (eq > 0) {
      map.set(
        cookie.substring(0, eq).trim(),
        cookie.substring(eq+1).trim(),
      );
    }
  }
  console.log('map:', map);
  if (map.has("names")) {
    textbox.value = JSON.parse(map.get("names")).join("\n");
  }
  if (map.has("card-size")) {
    cardSize.value = JSON.parse(map.get("card-size")).value;
  }
}, 500);

function generateCards() {
  const postUrl = window.location.hostname === 'gwenscode.com'
    ? 'https://gwen.run/pf2cards/'
    : '/'
  ;
  const cardSize = Array.from(document.getElementsByName("card-size"))[0];
  const names = Array.from(new Set(Array.from(document.getElementsByClassName('spellnames'))
    .map(e => e.value)[0]
    .trim()
    .split("\n")
    .map(e => e.trim().toLocaleLowerCase())
    .filter(e => e.length > 0)));
  names.sort();
  document.cookie = "names=" + JSON.stringify(names) + ";";

  const cardSizeOption = Array.from(cardSize.children)
    .filter(c => c.value === cardSize.value)[0];
  const cardSizeValue = {
    value: cardSizeOption.value,
    width: cardSizeOption.getAttribute("data-width"),
    height: cardSizeOption.getAttribute("data-height"),
    'body-text': cardSizeOption.getAttribute('data-body-text'),
    'head-text': cardSizeOption.getAttribute('data-head-text'),
  };

  document.cookie = "card-size=" + JSON.stringify(cardSizeValue) + ";";

  document.write('Loading, this may take several seconds ...');
  fetch(postUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(names),
  }).then(x => x.text()).then(x => {
    document.open();
    document.write(x);
    const r = document.querySelector(':root');
    r.style.setProperty('--card-width', cardSizeValue.width);
    r.style.setProperty('--card-height', cardSizeValue.height);
    r.style.setProperty('--body-text', cardSizeValue['body-text']);
    r.style.setProperty('--head-text', cardSizeValue['head-text']);
    console.log('card size', cardSizeValue);
  });
}

