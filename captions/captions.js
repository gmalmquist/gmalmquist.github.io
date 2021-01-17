class Bounds {
  constructor(left, right, top, bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  get height() {
    return this.bottom - this.top;
  }

  get width() {
    return this.right - this.left;
  }

  copy() {
    return new Bounds(this.left, this.right, this.top, this.bottom);
  }
}

Bounds.from = bounds => {
  const {left, right, top, bottom} = bounds;
  return new Bounds(left, right, top, bottom);
};

class Caption {
  constructor(bounds, text='') {
    this.bounds = bounds.copy();
    this.text = text;
    this.preferredSize = 96;
    this.lineWidth = 10;
    this.fillStyle = '#ffffff';
    this.strokeStyle = '#000000';
    this.textAlign = 'center';
    this.vertAlign = 'middle';
    this.renderBounds = false;
    this._layout = [];
  }

  render(g) {
    if (this.renderBounds) {
      g.strokeStyle = '#000000';
      g.lineWidth = 1;
      g.strokeRect(
        this.bounds.left,
        this.bounds.top,
        this.bounds.width,
        this.bounds.height
      );
    }

    this.layout(g);

    g.lineWidth = this.lineWidth;
    g.lineCap = 'round';
    g.textBaseline = 'top';
    g.textAlign = 'left';

    for (let item of this._layout) {
      g.font = `${item.textSize}px sans-serif`;
      g.fillStyle = this.fillStyle;
      g.strokeStyle = this.strokeStyle;
      g.strokeText(item.word, item.x, item.y); 
      g.fillText(item.word, item.x, item.y);      
    } 
  }

  realign(layout) {
    if (layout.length === 0) {
      return;
    }

    const alignRow = row => {
      if (row.length === 0) return;

      const left = row[0].x;
      const right = row[row.length - 1].x + row[row.length-1].width;
      const width = right - left;

      let targetLeft = left;
      if (this.textAlign === 'right') {
        targetLeft = this.bounds.right - width;
      } else if (this.textAlign === 'center') {
        targetLeft = this.bounds.left + this.bounds.width/2 - width/2;
      }

      for (let item of row) {
        item.x += targetLeft - left;
      }

      if (this.textAlign === 'justify') {
        if (row.length === 1) {
          return;
        }
        const padding = (this.bounds.width - width) / (row.length - 1);
        for (let i in row) {
          row[i].x += padding * i;
        }
      }
    };

    let rowCount = 0;
    let row = [];
    let y = -1;
    for (let item of layout) {
      if (item.y > y) {
        alignRow(row);
        y = item.y;
        row = [];
        rowCount += 1;
      }
      row.push(item);
    }
    alignRow(row);

    const layoutHeight = rowCount * layout[0].textSize;
    const verticalOffset = (() => {
      let topTarget = null;
      if (this.vertAlign === 'top') {
        topTarget = this.bounds.top;
      } else if (this.vertAlign === 'middle') {
        topTarget = this.bounds.top + this.bounds.height/2 - layoutHeight/2;
      } else if (this.vertAlign === 'bottom') {
        topTarget = this.bounds.bottom - layoutHeight;
      }
      return topTarget - layout[0].y;
    })();

    for (let item of layout) {
      item.y += verticalOffset;
    }
  }

  layout(g) {
    const lines = this.text.split('\n');
    let textSize = this.preferredSize;
    for (let textSize = this.preferredSize; textSize > 0; textSize--) {
      const layout = [];
      let y = this.bounds.top - textSize;
      g.font = `${textSize}px sans-serif`;
      for (let line of lines) {
        let x = this.bounds.left;

        y += textSize;
        for (let word of line.split(' ')) {
          let width = g.measureText(word).width;
          if (x > this.bounds.left && x + width > this.bounds.right) {
            x = this.bounds.left;
            y += textSize;
          }
          layout.push({ x, y, word, width, textSize });
          x += width + g.measureText(' ').width;
        }
      }
      if (y + textSize < this.bounds.bottom) {
        console.log('text size:', textSize);
        this.realign(layout);
        this._layout = layout; 
        return; // The text fits, don't need to shrink.
      }
    }
  }
}

$(document).ready(() => {
  const textBox = $('#caption-text');
  textBox.val(`Enter text here.
The quick brown fox jumps over the lazy dog.
Once upon a time, in a far away land, there was a duck. Now, this duck was very beautiful.

So beautiful in fact, that people would travel from miles around to see it. They would line up on the streets to call its name....`);

  const canvas = document.getElementById('canvas');
  const g = canvas.getContext('2d');

  const visualHeight = $(window).height() - $(canvas).offset().top - 20;
  $(canvas).css('height', `${visualHeight}px`);
  $(canvas).css('width', `${canvas.width * visualHeight / canvas.height}px`);

  const render = () => {
    g.clearRect(0, 0, canvas.width+1, canvas.height+1);
    g.strokeStyle = '#000000';
    g.lineWidth = 1;
    g.strokeRect(0, 0, canvas.width, canvas.height);

    const caption = new Caption(
      new Bounds(
        canvas.width * 0.10, canvas.width * 0.90,
        canvas.height/2, canvas.height * 0.80
      ),
      textBox.val(),
    );

    caption.render(g);
  }

  render();

  textBox.on('keyup', () => {
    render();
  });
});
