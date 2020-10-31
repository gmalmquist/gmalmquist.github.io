$(document).ready(() => {
  const regexInput = $('#regex');
  regexInput.val([
    'I1text$|(I0M0:p1i5j5$)|M0:ltr\-H|M1:ltr\-[ap]|M2:ltr\-[py]|M3:sym[-][ ]|M4:ltr[-][H]|M5:ltr\-[al]|M6:ltr-[lo]|M7:ltr-w|M8:ltr-e|M9:(ltr|sym)-[en!]',
    '|I2pumpkin|I2.*?i9j3',
    '|I3witch.hat|I3.*?i8j3|I8.*?spin',
    '|I4bat|I4.*?i8j9',
    '|I3:rotate45',
    '|I1:rotate355',
    '|I5bat|I5.*?i2j6',
    '|I6bat|I6.*?i4j2|I6.*?flip-x',
    '|I7pumpkin|I7.*?i9j7|I6.*?flip-x|I7.*?rotate10$',
    '|I8witch.hat|I8.*?i2j8|I3.*?rotate350$',
    '|I[456].*?orbit',
    '|I0background',
    '|trees',
    '|stars',
    '|:ground',
    '|I9pumpkin|I9.*?i9j6',
    '|I10pumpkin|I10.*?i9j5',
  ].join('\n'));

  const BAT_IMAGE = new Image();
  BAT_IMAGE.src = 'bat.png';

  const lerp = (a, b, s) => (1.0 - s) * a + s * b;

  setInterval(function() {
    const canvas = document.getElementById('canvas');
    const g = canvas.getContext('2d');
    const width = $(canvas).width();
    const height = $(canvas).height();

    canvas.width = width;
    canvas.height = height;

    g.clearRect(0, 0, width+1, height+1);

    g.strokeStyle = '#000000';
    g.strokeRect(0, 0, width, height);

    const regexText = regexInput.val().replace(/\n/gi, '');
    const pattern = new RegExp(regexText);

    const globalModifiers = [
        { id: 'text-left', apply: ctx => { ctx.g.textAlign = 'left'; } },
        { id: 'text-right', apply: ctx => { ctx.g.textAlign = 'right'; } },
        { id: 'text-bottom', apply: ctx => { ctx.g.textAlign = 'bottom'; } },
        { id: 'text-top', apply: ctx => { ctx.g.textAlign = 'top'; } },
    ];

    const now = Date.now();

    const transformModifiers = [
        { id: 'flip-x', apply: ctx => { ctx.g.scale(-1, 1); } },
        { id: 'flip-y', apply: ctx => { ctx.g.scale(1, -1); } },
        { id: 'spin', apply: ctx => {
          const angle = (now * Math.PI / 2 / 1000.0) % 360.0;
          ctx.g.rotate(angle);
        }},
        { id: 'orbit', apply: ctx => {
          const angle = (now * Math.PI / 2 / 1000.0);
          const radius = lerp(50, 75, Math.abs(Math.sin(now / 900.0)));
          ctx.g.translate(Math.sin(angle) * radius, Math.cos(angle) * radius);
        }},
    ];

    for (let angle = 0; angle < 360; angle++) {
      transformModifiers.push({
        id: `rotate${angle}`,
        apply: ctx => { ctx.g.rotate(angle * Math.PI / 180); }
      });
    }

    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        globalModifiers.push({
          id: `p1i${i}j${j}`,
          apply: ctx => {
            ctx.x = width * (j - 0.5) / 9.0;
            ctx.y = height * (i - 0.5) / 9.0;
          },
        });

        globalModifiers.push({
          id: `p2i${i}j${j}`,
          apply: ctx => {
            ctx.x = width * (j - 0.5) / 9.0;
            ctx.y = height * (i - 0.5) / 9.0;
          },
        });
      }
    }

    const addLetter = c => {
      globalModifiers.push({
        id: `ltr-${c}`,
        apply: ctx => {
          ctx.textBuffer.push(c);
        },
      });

    };

    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
      addLetter(String.fromCharCode(i));
      addLetter(String.fromCharCode(i + 'A'.charCodeAt(0) - 'a'.charCodeAt(0)));
    }

    for (const c of [' ', ',', '.', '!', '?']) {
      globalModifiers.push({
        id: `sym-${c}`,
        apply: ctx => {
          ctx.textBuffer.push(c);
        },
      });
    }

    const library = [
      {
        id: 'text',
        modifiers: [
        ],
        applyDefaults: ctx => {
          const g = ctx.g;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.font = '32px sans-serif';
          g.fillStyle = '#ffffff';
        },
        render: (ctx) => {
          g.fillText(ctx.textBuffer.join(''), ctx.x, ctx.y);
        },
      },
      {
        id: 'pumpkin',
        modifiers: [
        ],
        applyDefaults: ctx => {
          g.strokeStyle = '#000000';
          g.lineWidth = 5;
          g.fillStyle = '#ffa500';
        },
        render: (ctx) => {
          const g = ctx.g;

          g.beginPath();
          g.moveTo(ctx.x, ctx.y);
          g.lineTo(ctx.x, ctx.y - 25);
          g.lineTo(ctx.x + 5, ctx.y - 30);
          g.lineTo(ctx.x + 15, ctx.y - 35);
          g.stroke();
          g.closePath();

          const order = [0, 4, 1, 3, 2];
          for (let i of order) {
            g.save();
            g.beginPath();
            g.translate(ctx.x - 25 + i * 12, ctx.y);
            g.scale(0.5, 1 - Math.abs(i - 2)/20.0);
            g.arc(0, 0, 25, 0, 2*Math.PI, false);
            g.scale(1, 1);
            g.fill();
            g.stroke();
            g.closePath();
            g.restore();
          }
        },
      },
      {
        id: 'witch-hat',
        modifiers: [],
        applyDefaults: ctx => {
          g.strokeStyle = '#000000';
          g.strokeWidth = 5;
          g.fillStyle = '#554455';
        },
        render: (ctx) => {
          const g = ctx.g;

          g.beginPath();
          g.moveTo(ctx.x - 25, ctx.y + 20);
          g.bezierCurveTo(
            ctx.x - 25, ctx.y + 25,
            ctx.x + 25, ctx.y + 25,
            ctx.x + 25, ctx.y + 20
          );
          g.lineTo(ctx.x + 10, ctx.y + 15);
          g.lineTo(ctx.x + 5, ctx.y - 15);
          g.lineTo(ctx.x, ctx.y - 25);
          g.lineTo(ctx.x - 4, ctx.y - 4);
          g.lineTo(ctx.x - 10, ctx.y + 15);
          g.closePath();
          g.fill();
          g.stroke();
        },
      },
      {
        id: 'bat',
        modifiers: [],
        applyDefaults: ctx => {
          g.strokeStyle = '#000000';
          g.strokeWidth = 5;
          g.fillStyle = '#555555';
        },
        render: (ctx) => {
          const g = ctx.g;
          const w = BAT_IMAGE.width * 50 / BAT_IMAGE.height;
          const h = 50;
          g.drawImage(
            BAT_IMAGE,
            ctx.x - w/2,
            ctx.y - h/2,
            w,
            h,
          );
        },
      },
      {
        id: 'background',
        modifiers: [
          {
            id: 'trees',
            apply: ctx => { ctx.trees = true; },
          },
          {
            id: 'stars',
            apply: ctx => { ctx.stars = true; },
          },
          {
            id: 'ground',
            apply: ctx => { ctx.ground = true; },
          },
        ],
        applyDefaults: ctx => {
          g.fillStyle = '#222222';
          g.fillStyle = '#000000';
        },
        render: ctx => {
          const g = ctx.g;
          g.save();
          g.resetTransform();

          // gray background
          g.fillRect(0, 0, width, height);

          const horizonY = height * 0.5;

          // night sky gradient
          for (let i = Math.floor(horizonY); i >= 0; i--) {
            const s = Math.pow(1.0 * i / horizonY, 3.0);
            g.strokeStyle = `rgb(${lerp(0, 80, s)}, 0, ${lerp(0, 80, s)})`;
            g.beginPath();
            g.moveTo(0, i);
            g.lineTo(width, i);
            g.stroke();
          }

          if (ctx.ground) {
            // ground gradient
            const groundStep = 10;
            const groundY = height * 0.6;
            for (let i = Math.floor(groundY); i <= height; i += groundStep) {
              const s = 1.0 * (i - groundY) / height;
              for (let x = 0; x < width; x += groundStep) {
                //const p = Math.sin(s * Math.PI * 3) * Math.cos(Math.PI * x / width);
                const p = perlinNoise(x, i) * Math.pow(s, 2.0);
                const value = Math.max(0, p * 80);
                g.fillStyle = `rgb(${1*value}, ${0.5*value}, ${0*value})`;
                g.fillRect(x, i, groundStep, groundStep);
              }
            }
          }

          // stars
          const starCount = ctx.stars ? 100 : 0;
          for (let i = 0; i < 100; i++) {
            const x = Math.sin(2 * Math.PI * i / starCount) * width/2 + width/2;
            const y = Math.cos(2 * Math.PI * (i * 11) / starCount) * horizonY/2 + horizonY/2;
            g.fillStyle = `rgba(255, 255, 255, ${lerp(1, 0, y/horizonY)})`;
            g.fillRect(x, y, 1, 1);
          }

          // tree line
          const drawTree = (w, h) => {
            g.beginPath();
            g.moveTo(w * 0.5, 0);
            g.lineTo(w * 0.7, h * 0.25);
            g.lineTo(w * 0.6, h * 0.25);
            g.lineTo(w * 0.8, h * 0.50);
            g.lineTo(w * 0.6, h * 0.50);
            g.lineTo(w * 0.9, h * 0.75);
            g.lineTo(w * 0.6, h * 0.75);
            g.lineTo(w * 1.0, h * 1.00);
            g.lineTo(0, h);
            g.lineTo(w * 0.4, h * 0.75);
            g.lineTo(w * 0.1, h * 0.75);
            g.lineTo(w * 0.4, h * 0.50);
            g.lineTo(w * 0.2, h * 0.50);
            g.lineTo(w * 0.4, h * 0.25);
            g.lineTo(w * 0.3, h * 0.25);


            g.closePath();
            g.fill();
          };

          const treeCount = ctx.trees ? 30 : 0;

          g.fillStyle = '#000000';
          for (let i = 0; i < treeCount; i++) {
            g.save();
            g.translate(lerp(-width/10, width*1.1, i/(treeCount-1.0)), (horizonY/4) + horizonY * (0.2 + 0.2 * Math.sin(Math.PI * 9 * i / treeCount)));
            drawTree(width / 10, horizonY);
            g.restore();
          }

          g.restore();
        },
      }
    ];

    const createdItemTokens = new Set();

    let anyNewItems = true;
    for (let iteration = 0; iteration < 100 && anyNewItems; iteration++) {
      anyNewItems = false;
      for (const item of library) {
        if (pattern.exec(`I${iteration}${item.id}`)) {
          const context = {
            g: g,
            x: width/2,
            y: height/2,
            x2: width/2,
            y2: height/2,
            width: width,
            height: height,
            textBuffer: [],
          };

          // Global defaults.
          g.resetTransform();
          g.strokeStyle = '#000000';
          g.fillStyle = '#000000';

          item.applyDefaults(context);

          const appliedModifiers = [];

          let maxIterations = 50;
          let appliedAnyMods = true;
          for (let iter = 0; iter < maxIterations && appliedAnyMods; iter++) {
            appliedAnyMods = false;
            for (const mod of globalModifiers) {
              if (pattern.exec(`I${iteration}M${iter}:${mod.id}`)) {
                mod.apply(context);
                appliedModifiers.push(mod.id);
                appliedAnyMods = true;
              }
            }
            for (const mod of item.modifiers) {
              const expr = `I${iteration}M${iter}:${mod.id}`;
              const match = pattern.exec(expr);
              if (match) {
                mod.apply(context);
                appliedModifiers.push(mod.id);
                appliedAnyMods = true;
              }
            }
          }

          // Translate the transformation matrix so that the object
          // is drawn is if it were at the origin, so that transformation
          // modifiers like scale and rotate don't affect the global x,y
          // position.
          g.translate(context.x, context.y);
          context.x = 0;
          context.y = 0;

          for (const mod of transformModifiers) {
            if (pattern.exec(`I${iteration}:${mod.id}`)) {
              mod.apply(context);
              appliedModifiers.push(mod.id);
            }
          }

          const itemToken = `${item.id}: ${appliedModifiers.join(';')}`;
          if (createdItemTokens.has(itemToken)) {
            continue;
          }
          createdItemTokens.add(itemToken);


          item.render(context);
          anyNewItems = true;
        }
      }
    }
  }, 20);
});
