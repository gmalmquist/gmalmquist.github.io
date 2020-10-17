const lerp = (a, b, s) => (1.0 - s) * a + s * b;

class Category {
  constructor(label, color, glyph) {
    this.label = label;
    this.color = color;
    this.glyph = glyph;
  }

  render(g, x, y) {
    const glyphRadius = 10;

    g.font = `${glyphRadius * 2}px sans-serif`;
    // We want thing spaced at a consistent width, so measure
    // off of the longest label.
    const textWidth = g.measureText('As Slang').width;
    const padding = 3;
    const totalWidth = textWidth + padding + glyphRadius * 2;

    g.fillStyle = this.color;
    this.glyph(g, x - totalWidth/2 + glyphRadius, y, glyphRadius);

    g.fillStyle = '#000000';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(this.label, x - totalWidth/2 + glyphRadius*2 + padding, y);
  }
}

$(document).ready(() => {
  const canvas = document.getElementById('canvas');
  const g = canvas.getContext('2d');

  const categories = [
    new Category('No', '#cc0000', (g, x, y, r) => {
      g.fillRect(x-r, y-r*0.8, r*2, r*2*0.8);
    }),
    new Category('Meh', '#cccc00', (g, x, y, r) => {
      g.save();
      g.translate(x, y);
      g.scale(1, 0.75);
      g.beginPath();
      g.arc(0, 0, r, 0, 2 * Math.PI);
      g.fill();
      g.restore();
    }),
    new Category('Yes', '#00cc00', (g, x, y, r) => {
      const s = r / Math.sqrt(2);
      g.save();
      g.translate(x, y);
      g.fillRect(-s, -s, s*2, s*2);
      g.rotate(Math.PI/4);
      g.fillRect(-s, -s, s*2, s*2);
      g.restore();
    }),
    new Category('As Slang', '#cc00cc', (g, x, y, r) => {
      g.save();
      g.translate(x, y);
      g.beginPath();
      g.moveTo(0, -r);
      g.lineTo(r, r);
      g.lineTo(-r, r);
      g.closePath();
      g.fill();
      g.restore();
    }),
  ];
 
  const columns = 3;

  const terms = [
    'She/her',
    'He/him',
    'They/them',
    'Miss',
    'Mrs',
    'Mr',
    "Ma'am",
    'Sir',
    'Lady',
    'Gentleman',
    'Girl',
    'Boy',
    'Man',
    'Woman',
    'Beautiful',
    'Handsome',
    'Cute',
    'Pretty',
    'Guy',
    'Dude',
    'Princess',
    'Prince',
    'Queen',
    'King',
  ]; 

  g.fillStyle = '#fff4d4';
  g.fillRect(0, 0, canvas.width, canvas.height);

  g.strokeStyle = '#000000';
  g.strokeRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const titleSize = 36;

  const title = ['What Terms Can You Use', 'For Me?']; 
  g.font = `bold ${titleSize}px sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#000000';
  for (let i = 0; i < title.length; i++) {
    g.fillText(title[i], canvas.width/2, titleSize * (i + 1) + padding);
  }

  for (let i = 0; i < categories.length; i++) {
    const x = lerp(padding, canvas.width - padding, (i + 1.0)/(categories.length+1));
    const y = titleSize * title.length + padding * 3;

    categories[i].render(g, x, y);
  }

  const checkboxSize = 24;
  const termsPerColumn = Math.floor(terms.length / columns);
  const longestTerm = terms.reduce((a, b) => a.length > b.length ? a : b)[0];
  g.font = `${checkboxSize}px sans-serif`;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  const termWidth = g.measureText(longestTerm).width;
  const termPadding = 20;
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const row = (i % termsPerColumn);
    const column = Math.floor(i / termsPerColumn);
    const y = titleSize * title.length + padding * 4 + 20 + row * checkboxSize * 2;
    const x = lerp(padding, canvas.width - padding, (column+1) / (columns + 1.0))
     - (termWidth + termPadding + checkboxSize);

    g.fillStyle = '#ffffff';
    g.fillRect(x, y, checkboxSize, checkboxSize);

    g.strokeStyle = '#000000';
    g.strokeRect(x, y, checkboxSize, checkboxSize);

    g.fillStyle = '#000000';
    g.fillText(term, x + checkboxSize + termPadding, y + checkboxSize/2);
  }

});
