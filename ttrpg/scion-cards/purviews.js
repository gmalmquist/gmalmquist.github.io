
const PURVIEWS = [
  {
    title: 'Artistry',
	subtitle: 'PURVIEW',
	flavor: 'The Beauty Purview depicts the transcendent grace and allure of those Gods known for their epic appearance. In addition to divine heights of physical appeal, this Purview is also capable of wielding and reshaping beauty itself as a fundamental force, granting blessings that manifest their recipient’s inner beauty or stripping away the good looks of foes.',
	innate: `You can express yourself through an artistic performance to communicate with those who experience it as though you were speaking to them, even if they don’t share a language.

This can also bypass Complications that would apply to rolls made through ordinary conversation, like trying to avoid being overheard, but not to the specific art form you use. Only the intended recipient of the message (which can be “everyone”) can perceive it.`,
  },
  {
    title: 'BEAUTY',
	subtitle: 'PURVIEW',
	flavor: 'The Beauty Purview depicts the transcendent grace and allure of those Gods known for their epic appearance. In addition to divine heights of physical appeal, this Purview is also capable of wielding and reshaping beauty itself as a fundamental force, granting blessings that manifest their recipient’s inner beauty or stripping away the good looks of foes.',
	innate: 'You may attempt a Feat of Scale when you roll to influence a character using your beauty, appearance, and body language. This includes seduction, but also cutting someone down with a withering glare or using body language to convince a guard you’re not a threat.',
  },
  {
    title: 'BEASTS',
	subtitle: 'PURVIEW',
	flavor: 'This is the Purview of divine authority over the animal kingdom. It holds sway over all animals, as well as the iconic and mythological symbolism which humanity has given to them: the lion’s courage, the eagle’s swift wings and sharp eyes, and the owl’s wisdom are all part of the Beasts Purview.',
	innate: 'Animals will never attack or harm you, unless they are compelled by magic, or are Legendary creatures themselves.',
  },
  {
    title: 'CHAOS',
    subtitle: 'PURVIEW',
    flavor: 'Chaos is the unshaped formlessness which preceded the World, and the entropic dissolution that will follow. Chaos encompasses all forms of disorder, both physical and social. Mishaps, mechanical accidents, and unintended consequences with disastrous results all fall under its Purview, as do the human experiences of confusion, social unrest, revolution, and anarchy.',
    innate: `You walk untouched through chaotic situations, taking no harm from random or haphazard dangers such as debris in a tornado, a freak traffic accident, or being trampled by shoppers on Black Friday.

  This does not protect you from damage that results from an action performed with intent to cause harm, like gunfire in a shootout, or environmental situations. This immunity extends to any non-magical dangerous terrain, unless a character in the scene actively created that peril with intent to harm. You still face any Complications that such situations would normally impose — you’re simply guaranteed to come through unscathed.`,
    long: true,
  },
  {
    title: 'DARKNESS',
	subtitle: 'PURVIEW',
	flavor: 'This Purview rules over the dark of night and those things it conceals, the shadows, and all other forms of darkness that blind or deceive the eye. Manipulate or command the darkness and shadow, or wield its spiritual essence to confound or mislead perception. Light can be snuffed out, just as the sun inevitably falls below the horizon to plunge each day into night. This Purview is also associated with dreams and sleep.',
	innate: `You can see in total darkness, even magical darkness.

You can also see into someone’s dreams by watching them while they sleep.`,
  },
  {
    title: 'DEATH',
	subtitle: 'PURVIEW',
	flavor: 'You do not need to be told what Death is. Whether they fear it, ignore it, or embrace it, all mortals live in the shadow of their mortality. Those with this Purview hold sway both over the end of life and that which comes after death, wielding divine authority over corpses, funeral grounds, the undead, and underworlds.',
	innate: `You can see and communicate with ghosts, shades, and other forms of the undead that are normally imperceptible.

In addition, you can perceive entryways to the Underworld.`,
  },
  {
    title: 'DECEPTION',
	subtitle: 'PURVIEW',
	flavor: 'Gods of Deception are masters of illusion and misdirection, confounding the mortal mind and senses. This Purview holds sway over appearances, disguises, and mirages in addition to lies and deceit.',
	innate: `Other characters face a +3 Complication on all Empathy rolls and Assess Attitude rolls against you.

If they don’t spend enough successes to overcome the Complication, you choose the result they get.`,
  },
  {
    title: 'EARTH',
	subtitle: 'PURVIEW',
	flavor: 'This Purview governs and shapes the elemental stuff of Earth, such as stone, soil, sand, metal, and crystal. It embodies the inexorable resilience with which the mountains and canyons weather the passage of centuries and the fury of the elements, but also the terrible strength of the avalanche and the earthquake.',
	innate: 'As long as you are standing on the ground (the bottom floor of a building counts) or an earthen surface, you cannot be forcibly moved from your location by any amount of physical force, and gain Enhancement 1 on Might and Stamina rolls.',
  },
  {
    title: 'EPIC DEXTERITY',
	subtitle: 'PURVIEW',
	flavor: 'This Purview defines the prowess of Gods renowned for their speed, agility, and precision, elevating mortal action to feats of Legend. It encompasses the impossible swiftness of fleet-footed deities, and miraculous feats of grace and agility.',
	innate: `So long as you continue to move towards a destination, you walk, run, or leap with effortless grace.

Any surfaces solid or liquid hold your weight as if you weighed no more than a feather, and you may effortlessly scale or descend vertical surfaces without a need for a handhold.`,
  },
  {
    title: 'EPIC STAMINA',
	subtitle: 'PURVIEW',
	flavor: 'This Purview encompasses the vitality, endurance, and resilience of invincible warriors and legendary ascetics, immortals among immortals. A Scion with this Purview can withstand deadly weapons and overwhelming danger as a mortal might ignore a housefly, and draw on nigh-infinite reserves of vital energy.',
	innate: 'You are immune to poison and disease unless they come from a source whose Legend is equal or greater than yours, and never face Complications or risk death from hunger, thirst, or exhaustion.',
  },
  {
    title: 'EPIC STRENGTH',
	subtitle: 'PURVIEW',
	flavor: 'This Purview encompasses the divine might of the Gods. It is supreme raw physical power, allowing those Scions with Epic Strength to utterly overwhelm their lessers by force of arms, accomplish deeds of impossible strength, or show up any gym rat who dares try to out lift them.',
	innate: `You have +1 Scale for the purposes of lifting, breaking, or carrying large objects.

You can use Might in place of Presence for intimidation, seduction, or building Bonds of camaraderie.`,
  },
  {
    title: 'FERTILITY',
	subtitle: 'PURVIEW',
	flavor: 'Fertility Gods hold power over the soil in which crops take root, the bonds of family, and sexuality and childbirth. This Purview holds sway over the vitality of plants, animals, and mortals, capable of bestowing powerful blessings on fields or families. However, it also governs famine, blight, and infertility, and can lay terrifying curses by withholding the gifts of Fertility.',
	innate: `Once per session, you can radiate an aura of vitality, causing flowers and other plant life to bloom and grow.

All allies out to long range may resolve a single Bruised or Injured Condition. This cannot heal Maimed Conditions.`,
  },
  {
    title: 'FIRE',
	subtitle: 'PURVIEW',
	flavor: 'The Purview of Fire holds sway both over literal flames, which hold power to destroy and create, and the metaphorical flames that burn in the mortal heart, from the fires of sultry passion to the illumination of enlightenment. In addition to creating and controlling literal fire, heat, and light, the miracles of this Purview can also cause sudden outbursts of passion, intense emotion, or inspiration.',
	innate: `You and your personal belongings cannot take damage or suffer any form of harm from fire, heat, or smoke inhalation.

You can walk through wildfires or industrial microwaves unharmed, swim in magma for as long as you can hold your breath, and perform similar feats of fireproof heroism.

Extreme cold is likewise harmless to you.`,
  },
  {
    title: 'FORGE',
	subtitle: 'PURVIEW',
	flavor: 'This is the Purview of divine smiths and craftsmen, those who created legendary Relics or taught the secrets of crafts and technology to mortals. It encompasses ancient arts such as blacksmithing, carpentry, and masonry, as well as crafts of the modern era like mechanical engineering and computer programming.',
	innate: `Your handiwork is infallible.

Whenever one of your craft projects would suffer Flaws due to the Complications of delicate work or any other source, subtract one point from the total amount of Flaws, down to a minimum of 0.`,
  },
  {
    title: 'FORTUNE',
	subtitle: 'PURVIEW',
	flavor: 'The Purview of Fortune exerts its power through blessings and curses, manipulating that which mortals call chance and the Gods know as destiny. It exerts the subtle power of coincidence and synchronicity, contriving events and changing the World. It is not prophecy, but it can tug at the threads of Fate to arrange improbable scenarios and enable deeds that defy belief.',
	innate: `You can sense the presence of Fatebindings when you interact with someone. If you later meet the other “half” of a binding that you have already sensed, you can tell the two characters are bound together.

You can also sense when a Prophet or Sorcerer manipulates Fate with their Knacks or other powers, identifying them as the one responsible even if the effect cannot normally be perceived.`,
  },
  {
    title: 'FROST',
	subtitle: 'PURVIEW',
	flavor: 'This Purview governs snowfalls and blizzards, the season of winter, and all nature of frozen climes. In addition to elemental cold and ice, it holds power over things symbolically associated with cold, such as inaction or cold-heartedness, or with the season of winter, like the death of plants or hibernation.',
	innate: `You never suffer harm from extreme cold, nor difficult terrain or Complications due to snow, hail, or ice.

You may walk over water or even clouds, as it turns to solid ice underfoot long enough to support you.`,
  },
  {
    title: 'HEALTH',
	subtitle: 'PURVIEW',
	flavor: 'The Health Purview governs the well-being and life force of humanity, with power to mend infirmity, cure disease, and cleanse toxins. Gods who hold this Purview are capable of great miracles of healing, but also hold sway over illness, pestilence, and the ravages of age, and can wield them to smite their enemies.',
	innate: 'Once per session, when you successfully rovide treatment to a Storyguide character ally that resolves an Injury Condition, Poisoned Condition, or disease, you gain one Legend.',
  },
  {
    title: 'JOURNEYS',
	subtitle: 'PURVIEW',
	flavor: 'The Gods of Journeys hold power over the roads and routes that cross the World, from the tar and asphalt of the highways to the secret gates that lead to otherworldly realms. It governs not just movement, but also vehicles, roadways, trade routes, and the increasingly sophisticated transit infrastructure of the modern World.',
	innate: `You have an unfailing sense of direction, allowing you to find a route that leads to any point in the World as an unrolled action, unless its position is obscured by magic.

You can sense the presence of an Axis Mundi or other gate between realms of existence from (Legend) miles away`,
  },
  {
    title: 'MOON',
	subtitle: 'PURVIEW',
	flavor: 'This Purview holds sway over the moonlight, creating eerie light that reveals or distorts the truth. It also rules mutability and change, embodying the cyclicality of the moon’s phases through profound or subtle transformations.',
	innate: `You can radiate an aura of moonlight that cuts through darkness out to long range as a reflexive action. Only you and those you designate can perceive this illumination — others do not benefit from it.

You may pay 1 Legend to attempt to reveal the true form of any shapeshifters or other transformed characters within the moonlight, rolling Cunning + Legend against the Manipulation + Legend of a character that wishes to conceal the truth.`,
  },
  {
    title: 'ORDER',
	subtitle: 'PURVIEW',
	flavor: 'The Order Purview holds power over those things which bind civilizations and societies together in order: the sovereignty of kings and queens, the wisdom of judges and the justice of lawgivers, codes of law, social customs, and hierarchical authority.',
	innate: `You can sense the laws that govern any jurisdiction you stand in, letting you tell whether any action you witness or contemplate would be legal according to them.

Any mortal law enforcement acting in their official capacity that attempts to take action against you for a lawful act or overreach the bounds of authority is physically unable to do so — their body betrays them in the face of true justice.`,
  },
  {
    title: 'PASSION',
	subtitle: 'PURVIEW',
	flavor: 'Gods of Passion rule over the hearts of mortals. This Purview holds sway over love, jealousy, sorrow, anger, and every other shade of human emotion, and is capable of stirring them up until they overwhelm the rational mind.',
	innate: `You see into the hearts of others, gaining Enhancement 3 on Assess Attitude rolls.

If you observe someone who has a Bond towards another character present in the scene, you intuit the Bond’s existence.`,
  },
  {
    title: 'PROSPERITY',
	subtitle: 'PURVIEW',
	flavor: 'The Prosperity Purview governs wealth and commerce, the prosperity of peoples and cities, and the blessings of providence laid upon a God’s chosen people. Many Gods who hold it are tutelary deities, appointing themselves as the divine patrons of a kingdom or tribe that has won their favor.',
	innate: 'Whenever you exploit your wealth or financial status to influence someone, treat their Attitude towards you as one point higher. This does not stack with other magical Attitude bonuses.',
  },
  {
    title: 'SKY',
	subtitle: 'PURVIEW',
	flavor: 'This Purview is held by Gods of weather, winds, and lightning. It rules over every aspect of the sky: the soft rains that water the fields, the gentle breeze that cools, the fury of the tempest and the flashing power of the thunderbolt.',
	innate: 'You have perfect foreknowledge of the weather and climate around you up to at least a day in advance, and may ignore any Complications imposed by rain, wind, or other hazardous weather.',
  },
  {
    title: 'STARS',
	subtitle: 'PURVIEW',
	flavor: 'The Stars shine in the eternal firmament, infinitely distant from the World and yet inextricably bound to the most fundamental patterns of its existence. They offer guidance to mariners lost at sea and farmers following the cycle of the seasons, tracing out and defining the contours of both space and time through their celestial movements.',
	innate: 'As long as you are beneath the open sky, you can take a simple action to shift your senses to a God’s eye view, looking down on yourself and your surroundings out to long range from a top-down perspective.',
  },
  {
    title: 'SUN',
	subtitle: 'PURVIEW',
	flavor: 'This Purview holds sway over the Sun in all its aspects, both the life-giving rays that drive back winter and nourish the harvest and the scorching heat that brings drought and desert barrenness. This Purview also draws on the symbolism of the setting and rise of the Sun to promise rebirth, fulfill the hopes of those in the darkness, and purify the World of that which stalks in the night',
	innate: `You can radiate an aura of sunlight that pierces through darkness out to long range as a reflexive action.

You may spend 1 Legend to increase this radiance to blinding brilliance, imposing a +2 Complication on any attack rolls against you or an ally within the light.`,
  },
  {
    title: 'WAR',
	subtitle: 'PURVIEW',
	flavor: 'As long as there has been humanity, there has been war. From the earliest skirmishes between tribes to the great wars that shaped the course of history, mortals have looked to the Gods of war for their blessing. This Purview governs strife on a conceptual level as well as armed conflict. It may shape the tide of battles, uplift the destinies of soldiers and generals, or shatter fragile edifices of peace.',
	innate: `You can grant a group of Heavy followers the Savage tag with your blessing as an ordinary action.

This lasts indefinitely, but only one group can benefit from this at a time.`,
  },
  {
    title: 'WATER',
	subtitle: 'PURVIEW',
	flavor: 'From ancient wells and municipal waterworks to flowing rivers and vast oceans, all Water is governed by this Purview. It rules the ebb and flow of the tides, the sustaining and cleansing power of fresh water, and the untold perils of crashing waves and the deep sea.',
	innate: `You can breathe water like air and swim with flawless grace, ignoring any Complication for moving or acting underwater.

You are also immune to harm from the pressure or temperature of water.`,
  },
  {
    title: 'WILD',
	subtitle: 'PURVIEW',
	flavor: 'This is the Purview of untamed lands and the flora of the wilderness, wielded by Gods of nature or plants. It rules all wilderness, from forests and jungles to desert cacti to taiga evergreens. Its miracles can animate or control plant life, preserve the wilderness against human settlement, or draw on symbolic associations of wildness to unleash the inner beast of domesticated animals or humans.',
	innate: `You move through the wilderness with a dryad’s grace, ignoring any difficult or dangerous terrain based on dense undergrowth, fallen trees, briar patches, or similar plant-based hazards.

Add Enhancement 2 on all rolls to establish stealth while in a wilderness area.`,
  },
  {
    title: 'METAMORPHOSIS',
	subtitle: 'THEOI SIGNATURE PURVIEW',
	flavor: 'The mythos of the Theoi is replete with tales of transformation, old forms changed into new entities. Gods take on the shapes of animals and humans, weather and geography, even abstract forms such as thoughts or emotions. They also transform others, turning foes into beasts, lovers into flowers, and heroes into constellations. This Purview governs both kinds of transformations, allowing Theoi Scions to emulate their parents’ mutability',
	innate: `Your mutable nature lends itself to disguise.

When you conceal your identity by any means, trivial characters automatically fail to see through your deception. When you roll to disguise yourself or present yourself as someone else, you ignore any Complications from changing height, size, race, sex, or even species`,
  },
  {
    title: 'WYRD',
    subtitle: 'ÆSIR SIGNATURE PURVIEW',
    flavor: 'The Wyrd Purview encompasses the magic used by the Æsir and their worshippers to foretell and manipulate the fates spun by the Nornir. These include galdr (spells and charms) cast through runes or chanting, spá (prophecy), and the practice of seiðr in emulation of the Nornir',
    innate: `You have a personal fate that you know you are destined to meet.

  This might be a death whose circumstances mirror those of your divine parent’s fated doom in Ragnarok, a betrayal by those closest to you, the failure of an ambition, or some similar dramatic downfall.

  Whenever you encounter narrative difficulties that advance your fate or echo its circumstances, or because you are trying to avoid your fate, add 1 Momentum to the pool.`,
    long: true,
  },
  {
    title: 'YOGA',
    subtitle: 'DEVA SIGNATURE PURVIEW',
    flavor: 'The yogás are disciplines that cultivate the liberation of the spirit and realization of the ultimate self through selfless action (kárma yóga), personal devotion to divinities (bhakti yóga) and the pursuit of understanding the divine ( jñana yóga). With this Purview, the Devá and their Scions may acquire divine favor and blessings through the practice of these austerities and selfless service. Conveniently, the scriptures and epics in which the Devá feature are full of tales in which the reward of selfless service just happens to be, say, a bow that shoots nukes.',
    innate: 'Once per scene, when you act selflessly despite hardships in order to uphold a duty or serve someone else, you may allow another player to spend Momentum on an action without having to draw on one of their Virtues. Every point of Momentum they spend also adds another free die, as though they had the Virtuous Condition.',
    long: true,
  },
  {
    title: 'YAOYOROZU-NO-KAMIGAMI',
	subtitle: 'KAMI SIGNATURE PURVIEW',
	flavor: 'Every physical object, animal, and even human soul is one of the kami. Even natural phenomena, abstract concepts, and ideas are kami. This Purview holds sway over the proverbial “Eight Million Gods,” allowing them to be spoken with and propitiated in order that they might perform miracles at the Scion’s request.',
	innate: 'You can speak with the kami of objects and animals, allowing you to communicate and attempt to influence them. They have Attitude 2 towards you by default. The kami of objects have a limited degree of agency, primarily taking unrolled actions to do things the object might have done anyway. Sweet talking the kami of a car could convince it to start without keys, but not to drive around by itself.',
  },
  {
    title: 'CHEVAL/GUN',
	subtitle: 'LOA AND ORISHA SIGNATURE PURVIEW',
	flavor: 'This Purview is shared by the Òrìshà and the Loa, allowing them to take possession of their mortal worshippers. Through sacred drumming and dance, worshippers enter into a sacred trance state that makes room for the Gods to enter into them. The Òrìshà use the Yoruba word for this possession, Gún, while the Loa refer to it as Cheval to describe the way they “mount” the possessed person, as though they were a horse.',
	innate: 'You can tell whether any mortal you see is possessed by a spirit or deity and identify the nature of the possessing entity. You can attempt to drive out a possessing enemy with a Clash of Wills using Presence + Legend against its Resolve + Legend.',
  },
  {
    title: 'DODAEM',
    subtitle: 'MANITOU SIGNATURE PURVIEW',
    flavor: 'Scions may use this Purview to commune with the totemic dodaem manitou of all things: people, animals, places, and events. It allows personal communion with one’s own dodaem manitou, which brings meaningful dreams and can act as an intermediary with other manitou. It can also be used to enter into conversation with the World, asking the manitou for their favor in exchange for making offerings or abiding by a taboo. A Scion who has cultivated a strong relationship with a manitou can manifest or borrow its powers in exchange for performing a service.',
    innate: 'Once each scene, you can ask a manitou for its favor as a simple action. It grants Enhancement 3 on relevant rolls for the scene, such as those to hunt a bear or pass through a forest safely. In exchange, it will either ask you for a favor (e.g. the bear’s manitou needs a new charge after the hunt) or impose a restriction (e.g. the forest manitou forbids you from harming living things). You lose the Enhancement if you don’t honor the bargain, and the offended manitou may favor your foes until you make amends with it.',
    long: true,
  },
  {
    title: 'HEKU',
	subtitle: 'NETJER SIGNATURE PURVIEW',
	flavor: 'Heku is a tradition of magic that originated in ancient Egypt, practiced by the Netjer and their followers. It holds dominion over rebirth and the afterlife, exerting outward power in the form of sekhem, external life force, and through the many-part soul: Ren (name), Ib (heart), Sheut (shadow), Ba (personality), Ka (vital essence), and Ha (the sum of all these).',
	innate: 'You hold power over those whose ren, or true name, you know. For most mortals, this is their full given name, while the ren of mythical beings, cautious occultists, or Gods require more extensive research or subterfuge to uncover. Knowledge of a character’s ren grants Enhancement 2 on rolls to gain knowledge or understanding of them.',
  },
  {
    title: 'TIANMING',
	subtitle: 'SHEN SIGNATURE PURVIEW',
	flavor: 'The Shén order heaven, hell, and the World through a great celestial bureaucracy. At its head is the Jade Emperor, and from him all power flows downward in the form of positions and titles, privileges and responsibilities: the Tianming, or Mandate of Heaven. This Purview holds sway over the hierarchy of the heavens as well as all mortal bureaucracies, which are seen as Worldly extensions or reflections of the celestial model.',
	innate: 'You ignore all Complications from bureaucratic delay, corrupt officials, missing paperwork, long lines at the DMV, or similar obstacles that impede the right functioning of bureaucratic and official institutions.',
  },
  {
    title: 'NEXTLAHUALLI',
    subtitle: 'TEOTL SIGNATURE PURVIEW',
    flavor: 'The act of sacrifice binds together the Teōtl and their worshippers in reciprocity and mutual gratitude. The Teōtl sustain the World so that humanity can live in it, and in turn their worshippers sustain their Gods through sacrificing flowers, goods, animals, and human lives. Nextlahualli, literally meaning “debt repayment,” describes the cyclical relationship of offerings and obligations at the heart of Teōtl worship. Through this Purview, the Teōtl and their Scions draw sustenance and empowerment from sacrifice and wield that power on behalf of their worshippers.',
    innate: 'Each time you gain Legend from sacrifice, add 1 Momentum to the pool. Whenever you helping mortals who have sacrificed to you directly or the Teōtl causes narrative difficulties for you, you also add 1 Momentum to it.',
    long: true,
  },
  {
    title: 'GEASA',
	subtitle: 'TUATHA DE DANANN SIGNATURE PURVIEW',
	flavor: 'Geasa (singular geis) are rules, requirements, and prohibitions written into the fabric of Fate. This Purview binds the Tuatha and their Scions to geasa of their own and lets them lay geasa on others. It can influence the behavior of those under a geis, granting the power to uphold them or tempting Gods or mortals into breaking their geasa.',
	innate: 'You are under a geis. If you break it or otherwise resolve the Condition, the Storyguide should arrange for you to fall under another — either from a Tuatha or fellow Scion, one of the sidhe, the biting words of a poet, or simply mythic circumstance. You take on a second such geis upon becoming a Demigod, and a third upon becoming a God.',
  },
  {
    title: '',
	subtitle: 'PURVIEW',
	flavor: '',
	innate: '',
  },
];

createPages(PURVIEWS, 4, purview => {
  const e = document.createElement('div');
  e.setAttribute('class', `
    card purview
	${purview.title.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/, '-')}
  `);
  e.innerHTML = `
  <div class="column">
    <div class="title">${purview.title.toLocaleUpperCase()}</div>
    <div class="subtitle">${purview.subtitle}</div>
    <div class="flavor small ${purview.long ? 'long' : ''}">
      ${purview.flavor}
    </div>
	</div>
  <div class="column">
    <div class="field round-top round-bottom small">
      <div class="label">INNATE POWER</div>
      <div class="details ${purview.long ? 'long' : ''}">
        ${purview.innate.trim().replace(/\n+/g, '<p>')}
      </div>
    </div>
	</div>
	`;
  const wrap = document.createElement('div');
  wrap.setAttribute('class', 'purview-wrap');
  wrap.appendChild(e);
  return wrap;
});
