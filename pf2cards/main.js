setTimeout(() => {
  // read cookie
  const cookies = decodeURIComponent(document.cookie);
  const textbox = Array.from(new Set(Array.from(document.getElementsByClassName('spellnames'))))[0];
  for (const cookie of cookies.split(";")) {
    const parts = cookie.split("=");
    if (parts.length > 0 && parts[0].trim() == "names") {
      textbox.value = JSON.parse(parts[1].trim()).join("\n");
      break;
    }
  }
}, 500);

function generateCards() {
  const postUrl = window.location.hostname === 'gwenscode.com'
    ? 'https://gwen.run/pf2cards/'
    : '/'
  ;
  const names = Array.from(new Set(Array.from(document.getElementsByClassName('spellnames'))
    .map(e => e.value)[0]
    .trim()
    .split("\n")
    .map(e => e.trim().toLocaleLowerCase())
    .filter(e => e.length > 0)));
  names.sort();
  document.cookie = "names=" + JSON.stringify(names) + ";";
  document.write('Loading, this may take several seconds ...');
  fetch(postUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(names),
  }).then(x => x.text()).then(x => {
    document.open()
    document.write(x)
  });
}

