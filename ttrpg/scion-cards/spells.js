 const SPELLS = [
  {
    title: 'Teleportation Circle',
	purview: 'Journeys',
	action: 'Complex',
	range: '',
	duration: 'Indefinite',
	subject: '',
	mechanics: `You may <b>Spend 1 Legend</b> to inscribe a permanent teleportation circle. <i>(This takes ten minutes or so)</i>.

Thereafter, you may <b>Imbue 1 Legend</b> to travel to it from anywhere in the same realm of existence. <i>(This is a simple action)</i>.

<b>Linked circles.</b> You may link a pair of teleportation circles  to form a passage which anyone can freely traverse.

<b>Short-range circles.</b> You may create and maintain a number of short-range circles equal to your Legend for free. These circles cannot be used to travel more than a few hundred feet.

<i>You must already have a form of long-distance teleportation through a Boon or Knack to cast this.</i>`,
	clash: '',
  },
  {
    title: 'Spatial Paralysis',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Short',
	duration: 'Condition',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> to paralyze a foe, forcing any movement they take to cross an infinite distance.

Roll <i>Occult + Legend or Intellect</i> versus your foe's <i>Occult + Legend or Defense</i>, with a +2 Complication which you must meet for the spell to work at all.

If you win the roll, your excess successes form a  paralysis pool.

Your foe is paralysed as long as there are successes left in the paralysis pool. Each round at the end of their turn, they may make another roll to subtract successes from the pool.

The imbued Legend returns to you when your foe is no longer paralysed.

This is free against trivial targets, who cannot resist the effect.
`,
  },
  {
    title: 'Open',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Short',
	duration: 'Indefinite',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> and make an <i>Occult + Legend or Intellect</i> roll to open a lock or a barred door.

	Difficulty:
	1—mundane locks
	2—high-security locks
	3—mundane bank vaults
	4+—magic locks
	`,
	clash: '',
  },
  {
    title: 'Lock',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Short',
	duration: 'Indefinite',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> to close and lock a door or container.

As long as you keep the Legend imbued, characters trying to forcibly open the lock face an additional +3 Complication (for a door which was not already fitted with a lock, the Difficulty is simply 0 + 3c).
`,
  },
  {
    title: 'Guard Passage',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Short',
	duration: 'Indefinite',
	subject: '',
	mechanics: `<b>Spend 1 Legend</b> to protect a designated threshold—this can be a literal doorway, but may also be something like a tunnel, runway, or teleportation circle.

Anyone who attempts to cross the threshold against your wishes must make an opposed Occult + Legend or Intellect roll.

Characters without Legend are simply unable to cross the boundary against your will.

You may simultaneously protect a number of passages equal to your Legend.

<i>If you take this as a Boon, you may Imbue 1 Legend instead of Spending.</i>`,
	clash: '',
  },
  {
    title: 'Ghostly Light',
	purview: 'Death & Moon',
	action: 'Simple',
	range: 'Short',
	duration: 'One scene',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> to summon a soft gray-green light which reveals invisible ghosts and similarly hidden undead creatures.

The imbued Legend returns when you extinguish the light.`,
	clash: '',
  },
  {
    title: 'Alter Gravity',
	purview: 'Moon',
	action: 'Simple',
	range: 'Medium',
	duration: 'One scene',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> to reduce the gravity affecting your person or that of an ally to that of the moon, granting you a +2 Enhancement on one Athletics roll.

Alternatively, you can add a +3 Complication to another character's roll by manipulating the gravity around them.

<b>Spend 1 Legend</b> to instead create an area of reduced, increased, reversed, or otherwise altered gravity that affects the entire field for the rest of the scene. 

<i>If you take this as a Boon, you may Imbue 1 Legend instead of Spending.</i>`,
  },
  {
    title: 'Wither',
	purview: 'Death',
	action: 'Complex',
	range: 'Short',
	duration: '',
	subject: '',
	mechanics: `<b>Spend 1 Legend</b> and a few minutes to drain the life from your surroundings, healing yourself in the process (downgrade a an injury condition to a less severe injury, or remove a bruised injury condition altogether).

This causes plants and small animals in your vicinity to wither and die.`,
  },
  {
    title: 'Spectral Seagull (••)',
	purview: 'Death',
	action: 'Complex',
	range: '',
	duration: '',
	subject: '',
	mechanics: `<b>Imbue 1 Legend</b> into an offering of ethereal hotdog pieces to summon that one seagull ghost as a familiar <i>(this takes several minutes)</i>.

<b>Qualities:</b> Incorporeal 
<b>Flairs:</b> Telekinesis
<b>Primary Dice Pool (4):</b> Being Spooky, Telekinesis, Reconnaissance
<b>Health:</b> 2
<b>Defense:</b> 3

If taken out, the seagull returns to the underworld, and must remain there for at least 24 hours before being summoned again.

<b>Imbue 1 Legend</b> to see out the eyes of the seagull (for as long as the Legend is imbued).`,
  },
  {
    title: 'Moon Walk',
	purview: 'Journeys & Moon',
	action: 'Simple',
	range: 'Close',
	duration: 'One scene',
	subject: 'Self and Legend companions',
	mechanics: `<b>Imbue 1 Legend</b> and spend a few minutes spellcasting to reduce the gravity on your person and that of any companions to that of the moon, allowing you to walk or run three times faster than normal.

The distance you can move in a turn is tripled, and you can cover long-distances in a third of the usual time when walking, jogging, or sprinting.

You may <b>Spend 1 Legend</b> instead to cast this spell in an instant, in which case this spell also confers a +2 Enhancement bonus to your Athletics rolls in combat scenes.`,
  },
  {
    title: 'Exorcise',
	purview: 'Death',
	action: 'Complex',
	range: 'Short',
	duration: 'One scene',
	subject: 'One spirit or haunting',
	mechanics: `<b>Imbue 1 Legend</b> and roll <i>Occult + Legend or Intellect</i> to banish an undead spirit to the afterlife.

The Difficulty of this roll is variable depending on the nature of the spirit, how it is tied to the world, and other situational factors. Willing spirits may be exorcised for free, barring extenuating circumstances.

This is a complex action—you may roll multiple times over multiple turns and add together the results—but if you stop working the spell at any point you must start over (and may further anger the spirit).`,
  },
  {
    title: 'Moonlit Clearing',
	purview: 'Moon',
	action: 'Complex',
	range: 'Close',
	duration: 'Indefinite',
	mechanics: `<b>Spend 1 Legend</b> to amplify the lunar energies associated with witchcraft in a particular place where the sky is visible—such as a forest clearing, an old playground, or a rooftop. This takes a several minute ritual.

From then on, the moon is always visible in this location at night (except during the new moon), and anyone practicing spellcraft there at night receives a +2 Enhancement bonus to their Occult rolls.

You may use this spell multiple times for different places, but may not maintain more such hallowed places than you have dots in Legend.

If you take this as a Boon, you may Imbue 1 Legend instead of Spending.`,
  },
  {
    title: 'Rust and Ruin',
	purview: 'Death & Journeys',
	action: 'Simple',
	range: 'Close',
	duration: 'Indefinite',
	mechanics: `<b>Imbue 1 Legend</b> to bring an end to the journey of a machine, vehicle, or structure.

Machines inconsequential to the narrative—not owned or operated by important characters or Scions—are considered trivial targets and are instantly destroyed, reduced to rust, rot, and dust (whatever is appropriate given the material construction of the target).

For machines actively being used by a foe, roll <i>Occult + Intellect or Legend</i> as an attack against whatever skill used to operate the machine (e.g. <i>Pilot or Technology</i>) plus <i>Defense or Legend</i>; successes may be spent on "injuries" which may incapacitate or outright destroy the machine.`,
  },
  {
    title: 'Silence',
	purview: 'Moon',
	action: 'Simple',
	range: 'Short',
	duration: 'One scene',
	mechanics: `<b>Imbue 1 Legend</b> to invoke the silence of the lunar surface or the stillness of a quiet night, granting a +2 Enhancement on a single roll to avoid being heard.

<b>Alternatively,</b> this may be used to impose a +3 Complication on the roll of a foe when sound or speech is important to their task—obstructing attempts at persuasion, conveying orders, chanting incantations, etc.

<b>Spend 1 Legend</b> instead to apply a similar silence condition which affects an entire field.`,
  },
  {
    title: 'Illusion',
	purview: 'Moon',
	action: 'Simple',
	range: 'Medium',
	duration: 'One scene',
	mechanics: `<b>Imbue 1 Legend</b> to create a minor visual illusion or mirage; this can impose a +3 Complication to against another character's roll <i>(confusing,  distracting, or otherwise deceiving  them)</i>.

    Alternatively, this may provide a +2 Enhancement to the roll of yourself or an ally where appropriate (e.g., a visual aid on an an intellectual task, cosmetic effects which aid persuasion or intimidation, etc).

	While potentially distracting or confusing, these illusions are obviously fabrications unless you <i>spend</i> Legend instead.`,
  },
  {
    title: 'Create Door',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Close',
	duration: 'Indefinite',
	mechanics: `<b>Spend 1 Legend</b> to conjure a functional door (or other appropriate aperture) in a wall or equivalent barrier.`,
  },
  {
    title: 'Magic Compass',
	purview: 'Journeys',
	action: 'Simple',
	range: '',
	duration: 'Indefinite',
	mechanics: `<b>Imbue 1 Legend</b> to conjure a compass which infallably points in the direction of a specific location of your choosing.

The compass continues to exist as long as the Legend is imbued, and may be given to other characters for their own use.`,
  },
  {
    title: 'Summon Vehicle',
	purview: 'Journeys',
	action: 'Simple',
	range: '',
	duration: '',
	mechanics: `<b>Spend 1 Legend</b> to conjure a mundane vehicle (a car, a motorcycle, a small plane, etc) ex nihilio.

In situations where such vehicles are readily available, you may instead <b>Imbue 1 Legend</b> to expedite the process and waive the usual cost of acquiring one (such as a rideshare or plane ticket).
`,
  },
  {
    title: 'Labyrinth',
	purview: 'Journeys',
	action: 'Simple',
	range: 'Short',
	duration: 'Indefinite',
	mechanics: `<b>Spend 1 Legend</b> to turn the current field into a twisting labyrinth.

Any characters in the field whom you do not consider friends or allies must immediately roll <i>Occult or Survival + Defense or Legend</i> opposed by your own <i>Occult + Legend or Intellect</i> to avoid being lost in the labyrinth.

Trivial characters automatically fail, and cannot escape without assistance from you or another character with Legend.

Escaping or otherwise navigating the labyrinth is a complex action with a Difficulty equal to your Occult dots plus your Legend dots.`,
  },
  {
    title: 'Lunar Curse',
	purview: 'Moon',
	action: 'Simple',
	range: 'Short',
	duration: 'Condition',
	mechanics: `<b>Spend 1 Legend</b> to impose a Curse on a character which takes effect on one night of each lunar month (e.g., a baleful transformation which takes place on the full moon).`,
  },
  {
    title: 'Turn Undead',
	purview: 'Death',
	action: 'Simple',
	range: 'Short',
	duration: 'One scene',
	mechanics: `<b>Imbue 1 Legend</b> to compel minor undead to flee from your presence.

Roll <i>Occult + Presence or Legend</i> versus their <i>Defense + Legend</i> when using this against more powerful undead.`,
  },
  {
    title: 'Guide to Death',
	purview: 'Death',
	action: 'Simple',
	range: 'Short',
	duration: '',
	mechanics: `<b>Imbue 1 Legend</b> to guide a willing spirit to the afterlife (provided it is not being supernaturally bound to the world).

This may also be used to immediately end the life of a dying or unconscious creature.
`,
  },
];

SPELLS.sort((a, b) => {
	const c = a.purview.localeCompare(b.purview);
	if (c !== 0) return c;
	return a.title.localeCompare(b.title);
});

createPages(SPELLS, 6, spell => {
  const e = document.createElement('div');
  e.setAttribute('class', `
    card spell
	${spell.purview.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/, '-')}
  `);
  const clash = spell.clash ? `
    <div class="field compact round-bottom">
	  <div class="label">CLASH</div>
	  ${spell.clash}
	</div>
  ` : '';
  const length = (() => {
    if (spell.length === 'very') return 'verylong';
	if (spell.length) return 'long';
	return '';
  })();
  const attributes = spell.isContinued ? '' : `
	<div class="row compact">
	  <div class="field small round-top">
		<div class="label">ACTION</div>
		${spell.action}
	  </div>
	  <div class="field small round-top">
		<div class="label">RANGE</div>
		${spell.range || '—'}
	  </div>
	  <div class="field small round-top">
		<div class="label">DURATION</div>
		${spell.duration || '—'}
	  </div>
	</div>
    ${spell.subject ? `<div class="field compact">
	  <div class="label">SUBJECT</div>
	  ${spell.subject || '—'}
    </div>` : ''}
  `;
  e.innerHTML = `
	<div class="title">
		${spell.title.toLocaleUpperCase()}
	</div>
    <div class="subtitle">
      ${spell.isContinued ? `<i>(continued)</i>` : `${spell.purview.toLocaleUpperCase()} SPELL`}
    </div>
	${attributes}
	<div class="field big ${spell.clash ? '' : 'round-bottom'} ${spell.isContinued ? 'round-top' : ''}">
		<div class="details ${length}">
			${spell.mechanics.trim()
				.replace(/\n{2,}/g, '<p>')
				.replace(/\n+/g, '<br>')}
			${spell.continues ? `<p><span class="tbc">continued on back ⟶</span>` : ''}
		</div>
	</div>
	${clash}
	`;
  return e;
});
