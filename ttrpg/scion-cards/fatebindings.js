const FATEBINDING = [
	{
		name: '',
		role: '',
		strength: '',
		notes: '',
		imperiled: '',
	},
];

const FATE_ROLES = [
	{
		title: 'Apprentice',
		callings: 'Creator, Sage',
		flavor: 'Fate encourages the Fatebound mortal to learn from the Scion, whether that’s a particular skill, a philosophy, or just general life lessons.',
		invoke: 'Apprentices learn by blundering into mistakes their teachers know to avoid. Invoke this Condition after a failed action; the Storyguide must offer a Complication rather than Consolation. If the Complication’s rating is equal to or less than the Fatebinding’s Strength, it affects the Apprentice instead.',
		compel: 'Apprentices choose the worst times to try to “help.” The Scion gains 1 Legend, and her next action is a mixed action: whatever she was originally trying to do, plus stopping her Apprentice from doing something disastrous. The Storyguide decides on a dice pool for the second action and consequences for failure, but it has a Difficulty equal to half the Fatebinding’s Strength.',
		resolve: 'Wisdom comes from the mouths of babes. Thanks to the Apprentice’s timely efforts, one complex action automatically achieves a number of Milestones equal to half the Fatebinding’s Strength. The Scion’s player then chooses one of the following options:',
		resolve_options: [
			'The Apprentice dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'The Apprentice decides he’s learned all he can from the Scion; convert this Fatebinding to a Rival of the same Strength.',
		],
<<<<<<< HEAD
		long: true,
=======
>>>>>>> 403c1594d4ad70b305977ca5a01127ff728e2bc8
	},
	{
		title: 'BALM',
		callings: 'Judge, Love, Warrior',
		flavor: 'The Fatebound is in the right position to calm the Scion, to balance her extremes and to keep her centered.',
		invoke: 'The Balm’s soothing presence makes the Scion question her Virtues. Compel this Condition when the Scion reinforces a Virtue: She gains 1 Legend, but earns no Momentum and only slides her Virtue if it would move her toward the center of the track.',
		compel: 'The Balm’s soothing presence makes the Scion question her Virtues. Compel this Condition when the Scion reinforces a Virtue: She gains 1 Legend, but earns no Momentum and only slides her Virtue if it would move her toward the center of the track.',
		resolve: 'A dramatic display of Virtue either changes the relationship forever or ends it catastrophically. The Scion immediately sets her Virtue to either the far left or the far right of the track and gains Momentum as though she’d just fulfilled that Virtue. The Scion’s player then chooses one of the following options:',
		resolve_options: [
			'The Balm dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'The Balm’s relationship with the Scion deepens; convert this Fatebinding to a Boon Companion, Paramour, or Unrequited Paramour of the same Strength.',
		],
	},
	{
		title: 'Boon Companion',
		callings: 'Healer, Hunter, Leader, Trickster',
		flavor: 'The Fatebound and the Scion share a deep bond of friendship, camaraderie, and trust.',
		invoke: 'The Boon Companion offers a timely bit of assistance. The Scion’s next action benefits from teamwork as though the Boon Companion had rolled a number of successes equal to the Fatebinding’s Strength.',
		compel: 'Boon Companions expect their friends to return the favor. The Scion gains 1 point of Legend, while the Boon Companion gains the Imperiled Condition. The Condition represents a favor the Boon Companion needs help with, and it resolves by reducing the Fatebinding’s Strength by 1. ',
		resolve: 'The Fatebound swoops in at a dramatic moment to help his Scion friend. Resolve this Condition after rolling an action: The Scion passes the action with Enhancements equal to the Fatebinding’s Strength. The Scion’s player then chooses one of the following options:',
		resolve_options: [
			'The Boon Companion dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'The relationship deepens; convert this Fatebinding to a Paramour (or an Unrequited Paramour).',
			'The Boon Companion turns against the Scion; convert this Fatebinding to a Nemesis of the same Strength.',
		],
	},
	{
		title: 'CANARY / MARTYR',
		callings: 'Guardian, Healer, Liminal',
		flavor: 'The Canary stumbles right into problems the Scion might otherwise miss or blunder into. Alternately, this Condition can represent the Martyr, who is ready and willing to sacrifice for the Scion.',
		invoke: 'Invoke this Condition after a botch: The Scion’s player may reroll the action she’s just botched. The Canary suffers any drawbacks or consequences of the botch in her place — perhaps wandering into a Jotun ambush or blurting out a faux pas.',
		compel: 'Canaries tend to get derogatory nicknames related to being taken hostage. The Scion gains 1 point of Legend and the Canary gains the Imperiled Condition. The Peril is always some form of imminent threat of death or grievous bodily harm.',
		resolve: 'The Canary’s sacrifice is great, but never in vain. The Canary removes a single dramatic, life-threatening obstacle in the current scene: a powerful enemy, a bomb counting down, etc., at the cost of his own life. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
	},
	{
		title: 'JINX',
		callings: 'Creator, Liminal, Sage',
		flavor: 'The Fatebound is singularly unlucky for the Scion. This might be inadvertent, like the eager would-be sidekick who always screws things up, or it might be deliberate, like an angry ghost that has cursed the Scion.',
		invoke: 'The Scion suffers a Narrative Disadvantage, exactly as though she had evoked a Path. She gains bonus Momentum equal to the Fatebinding’s Strength. The Narrative Disadvantage is related to the Fatebound character in some way.',
		compel: 'The bad luck spreads. The Scion gains 1 point of Legend, and one of her other Fatebound characters gains the Imperiled Condition. If the Scion has no other Fatebindings, the Storyguide chooses an SGC to suffer the Condition.',
		resolve: 'Resolve this Condition before a roll: The Jinx’s bumbling provokes consequences for the Scion equivalent to a botch. The Scion fulfills a Deed. The Scion’s player then chooses one of the following options:',
		resolve_options: [
			'The Jinx dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'The Jinx’s bad luck is finally too much. The Scion tells him to get out of her life forever, and the Jinx doesn’t take it well; convert this Fatebinding to a Rival of the same Strength.',
		],
	},
	{
		title: 'NEMESIS',
		callings: 'Guardian, Trickster, Warrior',
		flavor: 'The Fatebound becomes a sworn enemy of the Scion, and vice versa.',
		invoke: 'The Scion’s player defines how her Nemesis is involved in some oppositional element of the story: perhaps he hired the Oni mercenaries that attacked the band or is actually the killer they’re hunting. Because the Scion knows her Nemesis so well, she gains a reserve of Stunts equal to the Fatebinding’s Strength. These Stunts last until the end of the episode, and she can use them exactly like Stunts generated by threshold successes. ',
		compel: 'The Nemesis is always meddling in the character’s affairs. Compel this Condition before making a roll: The Scion gains a point of Legend and automatically fails the roll with a Consolation.',
		resolve: 'The Scion forces a dramatic confrontation with her Nemesis. Add the Bond’s Strength to both the Momentum and Tension pools. Depending on how the scene plays out, one of the following happens:',
		resolve_options: [
			'If the Scion kills her Nemesis, at the start of the next Episode, she automatically gains another Nemesis Fatebinding with a Strength 1 higher than the current one (maximum 5).',
			'If the Scion defeats her Nemesis but spares him, the Fatebinding increases in Strength by 1.',
			'If the Scion finds a way to make peace with her Nemesis, the Fatebinding becomes a Balm, Boon Companion, or Paramour.',
			'If the Scion loses, the Nemesis achieves a major story goal, introducing a complication that will have to be addressed in a future Episode. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
		],
		long: true,
	},
	{
		title: 'PARAMOUR',
		callings: 'Hunter, Lover',
		flavor: 'The Fatebound and the Scion are drawn to each other romantically.',
		invoke: 'The Scion makes a single use of a Lover Knack. If the Fatebinding’s Strength is 1-3, this must be a Heroic Knack. If the Strength is 4+, it may also be an Immortal Knack. If the Knack only works on a character the Scion loves, that has to be the Paramour.',
		compel: 'Love is hard work. The Scion gains a point of Legend, and the Paramour gains the Imperiled Condition. In the modern age the Peril is most likely a bit of conflict within the relationship, but sometimes Fate is a traditionalist and the Peril represents capture by the Scion’s enemies.',
		resolve: 'True love accomplishes miracles. When the Scion and her Paramour undertake a Teamwork action, they increase the action’s Scale by the Fatebinding’s Strength. The Scion’s player then chooses one of the following options:',
		resolve_options: [
			'The Paramour dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'Happy endings are boring, and Fate decides to throw some tragedy into the mix; convert this Fatebinding to a Canary or Traitor of the same Strength, or the Paramour gains the Imperiled Condition, with the Peril being serious relationship drama that threatens to end the relationship altogether.',
		],
<<<<<<< HEAD
		long: true,
=======
>>>>>>> 403c1594d4ad70b305977ca5a01127ff728e2bc8
	},
	{
		title: 'RIVAL',
		callings: 'Creator, Healer, Hunter, Lover, Warrior',
		flavor: 'Fate casts the mortal as a rival to the Scion in some arena; maybe they end up competing in business, or for the affections of the same third party.',
		invoke: 'When the Scion’s Rival is around, she does her best to show him up. The Scion gets Enhancements equal to the Fatebinding’s Strength on an action to best, outfox, or otherwise show up her Rival. The Rival doesn’t even have to be in the scene — just knowing he’ll hear about it is enough.',
		compel: 'The Scion’s Rival is also trying to show her up. The Scion gains 1 point of Legend, and the Rival gets Enhancements equal to the Fatebinding’s Strength on an action to best, outfox, or otherwise show up the Scion.',
		resolve: 'The Scion and the Rival put aside their differences momentarily, working together to deal with a greater threat. Resolve this Condition before rolling: For this roll only, the Scion’s player spends Tension from as though it were Momentum. She may spend a number of Tension equal to the Fatebinding’s Strength.',
		resolve_options: [
			'The Rival dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'That smoldering rivalry turns into sexual tension. This Fatebinding becomes a Traitor (Apparent: Paramour, Actual: Rival) with the same Strength.',
		],
<<<<<<< HEAD
		long: true,
=======
>>>>>>> 403c1594d4ad70b305977ca5a01127ff728e2bc8
	},
	{
		title: 'TRAITOR',
		callings: 'Judge, Leader, Sage, Trickster',
		flavor: 'The Fatebound has a knife to the Scion’s back. When this Fatebinding happens, the Storyguide, working in concert with the player, chooses an apparent Fatebinding and an actual Fatebinding. The Traitor acts as the apparent Fatebinding with a Strength of 2. Note that, unless the player actively chooses to let the Storyguide surprise her, this is not a secret, “gotcha” Fatebinding. The character remains ignorant of the coming betrayal, but the player does not. ',
		invoke: 'Each time the Scion invokes the apparent Fatebinding, make a tick mark on some scratch paper. When you have ticks equal to the apparent Fatebinding’s Strength, resolve this Fatebinding.',
		compel: 'As the compel effect of the actual Fatebinding. ',
		resolve: 'Fill the Tension pool to its maximum value, reveal the actual Fatebinding, and replace the apparent Fatebinding with the actual one. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
	},
	{
		title: 'WORSHIPPER / UNREQUITTED',
		callings: 'Judge, Leader, Lover, Liminal',
		flavor: 'The Fatebound stands in awe of the Scion, or the Fatebound is in love with the Scion, who does not reciprocate. Either way, he will do whatever he can to advance the Scion’s agenda.',
		invoke: 'The Scion can evoke the Resources or Narrative Advantage effect of one of the Worshipper’s Paths as though it was her own.',
		compel: 'The Worshipper turns his jealousy on the Scion’s other relationships. The Scion gains 1 point of Legend, and one of her other Fatebound characters gains the Imperiled Condition. The Peril relates to the Worshipper stalking or otherwise harassing the character. If the Scion has no other Fatebindings, the Storyguide chooses an SGC to suffer the Condition.',
		resolve: 'The Worshipper is willing to become whatever the Scion wants him to be. The Scion’s player chooses the Resolve effect of any other role Condition to resolve the Worshipper Condition. No matter what choices that Condition offers, the Scion’s player chooses one of the following options:',
		resolve_options: [
			'The Worshipper dies, or is otherwise taken out of play permanently. The Scion fulfills a Deed, and suffers a Failure Deed for an appropriate Calling.',
			'The Worshipper becomes even more fanatical in his devotion; convert this Fatebinding to a Martyr of the same Strength.',
			'The Worshipper turns against the Scion; convert this Fatebinding to a Nemesis of the same Strength.',
		],
		long: true,
	},
];

createPages(FATE_ROLES, 4, role => {
  const e = document.createElement('div');
  e.setAttribute('class', `
	card 
	fate-role 
	${role.title.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/, '-')}
  `);
  const options = role.resolve_options ? `<ul>${role.resolve_options.map(o => `<li>${o}`).join(' ')}</ul>` : '';
  e.innerHTML = `
  <div class="title">★ ${role.title.toLocaleUpperCase()} ★</div>
  <div class="subtitle">${role.callings}</div>
  <div class="flavor">${role.flavor}</div>
  <div class="field small round-top">
	<div class="label">INVOKE</div>
	<div class="details ${role.long ? 'long' : ''}">${role.invoke}</div>
  </div>
  <div class="field small">
	<div class="label">COMPEL</div>
	<div class="details ${role.long ? 'long' : ''}">${role.compel}</div>
  </div>
  <div class="field big round-bottom">
	<div class="label">RESOLVE</div>
	<div class="details  ${role.long ? 'long' : ''}">
	${role.resolve}
	${options}
	</div>
  </div>
  `;
  return e;
});

createPages(new Array(6).fill(FATEBINDING[0]), 6, f => {
  const e = document.createElement('div');
  e.setAttribute('class', 'card fatebinding');
  e.innerHTML = `
	<div class="title">★ FATEBINDING ★</div>
	<div class="field round-top">
	  <div class="label">CHARACTER NAME</div>
	  <input value="${f.name}"></input>
	</div>
	<div class="row">
		<div class="field big">
		  <div class="label">ROLE</div>
		  <input type="text" size="4" value="${f.role}"></input>
		</div>
		<div class="field compact">
		  <div class="label">STRENGTH</div>
		  <input type="text" size="4" value="${f.strength}"></input>
		</div>
		<div class="checkgrid compact">
		  <div class="check"></div>
		  <div class="check"></div>
		  <div class="check"></div>
		  <div class="check"></div>
		  <div class="check"></div>
		</div>
	</div>
	<div class="field big">
		<div class="label">NOTES</div>
		<textarea>${f.notes}</textarea>
	</div>
	<div class="field small round-bottom">
		<div class="label">IMPERILED</div>
		<textarea rows="2">${f.imperiled}</textarea>
	</div>`;
  return e;
<<<<<<< HEAD
});
=======
});
>>>>>>> 403c1594d4ad70b305977ca5a01127ff728e2bc8
