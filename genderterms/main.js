(function() { 
  const lerp = (a, b, s) => (1.0 - s) * a + s * b;

  class Rect {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }

    contains(x, y) {
      return x >= this.x && y >= this.y
        && x < this.x + this.w && y < this.y + this.h;
    }

    fill(g) {
      g.fillRect(this.x, this.y, this.w, this.h);
    }

    stroke(g) {
      g.strokeRect(this.x, this.y, this.w, this.h);
    }
  }

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

  const categoryMap = new Map();
  for (const cat of categories) {
    categoryMap.set(cat.label, cat);
  }

  // UI state
  const termMap = new Map();

  // UI constants
  const padding = 40;
  const titleSize = 36;
  const columns = 3;
  const footerSize = 12;

  const render = (canvas, drag) => {
    const g = canvas.getContext('2d');

    g.fillStyle = '#fff4d4';
    g.fillRect(0, 0, canvas.width, canvas.height);

    g.strokeStyle = '#000000';
    g.strokeRect(0, 0, canvas.width, canvas.height);

    const title = ['What Terms Can You Use', 'For Me?']; 

    const footer = [];
    if (terms.some(term => !termMap.has(term))) {
      footer.push(`Click the checkboxes to cycle through ${categories.map(c => c.label).join(', ')}`);
    }
    footer.push('Make your own at gwenscode.com/genderterms');

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

      const rect = new Rect(x, y, checkboxSize, checkboxSize);

      g.fillStyle = '#ffffff';
      g.strokeStyle = '#000000';
      rect.fill(g);
      rect.stroke(g);

      g.fillStyle = '#000000';
      g.fillText(term, x + checkboxSize + termPadding, y + checkboxSize/2);

      if (termMap.has(term)) {
        const catName = termMap.get(term);
        const category = categoryMap.get(catName);
        g.fillStyle = category.color;
        category.glyph(g, x + checkboxSize/2, y + checkboxSize/2, checkboxSize/2 * 0.8);
      }

      if (drag.clicked && rect.contains(drag.end.x, drag.end.y)) {
        if (termMap.has(term)) {
          for (let i = 0; i < categories.length; i++) {
            if (termMap.get(term) === categories[i].label) {
              termMap.set(term, categories[(i + 1) % categories.length].label);
              break;
            }
          }
        } else {
          termMap.set(term, categories[0].label);   
        }
      }
    }

    g.font = `${footerSize}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'bottom';
    g.fillStyle = '#000000';
    for (let i = 0; i < footer.length; i++) {
      const line = footer[i];
      g.fillText(
        line,
        canvas.width/2,
        canvas.height - padding - (footerSize * 2) * (footer.length - i - 1),
      );
    }
  };

  $(document).ready(() => {
    const canvas = document.getElementById('canvas');

    $('#download').click(() => {
      const img = new Image();
      const dataUrl = canvas.toDataURL('image/png');
      img.src = dataUrl;

      const w = window.open('', '_blank');
      w.document.write(img.outerHTML);
    });

    const getCoord = e => ({
      x: e.clientX - $(canvas).offset().left,
      y: e.clientY - $(canvas).offset().top,
    });

    const drag = {
      dragging: false,
      start: {x: 0, y: 0},
      end: {x: 0, y: 0},
      clicked: false,
    };

    canvas.addEventListener('mousedown', e => {
      drag.dragging = true;
      drag.start = getCoord(e);
      drag.end = getCoord(e);
    }, false);
    canvas.addEventListener('mousemove', e => {
      drag.end = getCoord(e);
    }, false);
    canvas.addEventListener('mouseup', e => {
      drag.end = getCoord(e);
      drag.dragging = false;
      drag.clicked = true;
    }, false);

    
    canvas.addEventListener('touchstart', e => {
      drag.dragging = true;
      drag.start = getCoord(e);
      drag.end = getCoord(e);
    }, false);
    canvas.addEventListener('mousemove', e => {
      drag.end = getCoord(e);
    }, false);
    canvas.addEventListener('touchend', e => {
      drag.end = getCoord(e);
      drag.dragging = false;
      drag.clicked = true;
    }, false);

    setInterval(() => {
      const wasClicked = drag.clicked;
      render(canvas, drag);
      if (wasClicked) {
        drag.clicked = false;
      }
    }, 20);
  });
})();
