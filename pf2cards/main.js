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

function shrinkText() {
  const cards = Array.from(document.getElementsByClassName('card'));
  let shrunk = false;
  for (const card of cards) {
    const cardRect = card.getBoundingClientRect();
    const cardBody = Array.from(card.getElementsByClassName("card-body"))[0];
    const bodyRect = cardBody.getBoundingClientRect();
    if (
      typeof cardRect !== 'undefined'
      && typeof bodyRect !== 'undefined'
      && bodyRect.bottom > cardRect.bottom
    ) {
      const fs = getComputedStyle(cardBody).getPropertyValue("font-size");
      card.style.fontSize = `calc(${fs} - 0.5pt)`;
      shrunk = true;
    }
  }
  return shrunk;
}

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
    corner: cardSizeOption.getAttribute("data-corner"),
    columns: parseInt(cardSizeOption.getAttribute("data-cols")),
    "body-text": cardSizeOption.getAttribute("data-body-text"),
    "head-text": cardSizeOption.getAttribute("data-head-text"),
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
    const props = {
      "--card-width": cardSizeValue.width,
      "--card-height": cardSizeValue.height,
      "--corner-radius": cardSizeValue.corner,
      "--card-columns": cardSizeValue.columns,
      "--body-text": cardSizeValue["body-text"],
      "--head-text": cardSizeValue["head-text"],
    };
    if (cardSizeValue.columns === 2) {
      props['--twos-h0'] = 'var(--page-margin)';
      props['--twos-v0'] = 'var(--page-margin)';
      props['--twos-h1'] = `calc((
        var(--page-width)
        - var(--page-margin) * 2
        - var(--card-width) * ${cardSizeValue.columns}
      ) / ${cardSizeValue.columns - 1} - 1pt)`
      .replaceAll('\\s', '');
      props['--twos-v1'] = `calc((
        var(--page-height)
        - var(--page-margin) * 2
        - var(--card-height) * 2
      ) - 1pt)`
      .replaceAll('\\s', '');
      props['--twos-break'] = 'always';
    }
    if (cardSizeValue.columns === 3) {
      props['--threes-h0'] = 'var(--page-margin)';
      props['--threes-v0'] = 'var(--page-margin)';
      props['--threes-h1'] = `calc((
        var(--page-width)
        - var(--page-margin) * 2
        - var(--card-width) * ${cardSizeValue.columns}
      ) / ${cardSizeValue.columns - 1} - 1pt)`
      .replaceAll('\\s', '');
      props['--threes-v1'] = `calc((
        var(--page-height)
        - var(--page-margin) * 2
        - var(--card-height) * 2
      ) - 1pt)`
      .replaceAll('\\s', '');
      props['--threes-break'] = 'always';
    }
    for (const key of Object.keys(props)) {
      r.style.setProperty(key, props[key]);
    }
    r.style.setProperty("--card-width", cardSizeValue.width);
    r.style.setProperty("--card-height", cardSizeValue.height);
    r.style.setProperty("--body-text", cardSizeValue["body-text"]);
    r.style.setProperty("--head-text", cardSizeValue["head-text"]);
    r.style.setProperty("--corner-radius", cardSizeValue.corner);
    const shrink = () => setTimeout(() => {
      if (shrinkText()) {
        shrink();
      }
    }, 50);
    setTimeout(() => {
      for (const card of document.getElementsByClassName('card')) {
        card.classList.add(`card${cardSizeValue.columns}`);
      }
    }, 50);
    shrink();
  });
}

