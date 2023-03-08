const BOONS = [
  {
    title: 'ENTHRALLING PERFORMANCE',
	purview: 'ARTISTRY',
	cost: 'Imbue 1 Legend',
	action: 'Complex',
	range: 'Medium',
	duration: 'Indefinite',
	subject: 'All characters',
	mechanics: `No one can look away from your art. 

When you put on a performance, all affected targets in range that witnesses your performance cannot stop paying attention to you. If they wish to take another action, they must do it as a mixed action combined with an Integrity + Resolve roll at Difficulty 2.

Putting on a performance with this Boon is a complex action that can last multiple rounds, but doesn’t require a roll.`,
	clash: 'Presence + Legend vs. Composure + Legend',
  },
  {
    title: 'HEARTFELT EXPRESSION',
	purview: 'ARTISTRY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: 'Short',
	duration: 'Indefinite',
	subject: 'All characters',
	mechanics: `Your emotions overflow into the souls of your audience. When you perform or create a work of art, you can instill it with your current emotional state or the personal feelings that inspired it.

Any affected character that witnesses the performance or artwork is deeply affected, raising their Attitude by one point. This does not stack with other magical Attitude bonuses.

This Attitude shift lasts even after you reclaim the Legend from this Boon. However, once you do so, your painting, music, or other artwork won’t inspire any more characters with emotion. Seeing multiple pieces of art made with this Boon doesn’t stack their Attitude boosts.`,
	clash: 'Presence + Legend vs. Composure + Legend',
  },
  {
    title: 'MUSE’S KISS',
	purview: 'ARTISTRY',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Short',
	duration: 'Short',
	subject: 'One character',
	mechanics: `You breathe inspiration into a character’s heart, granting them Enhancement 3 when they roll to create art, put on a performance, or some other creative and expressive activity. 

You can set a single requirement the character must meet to maintain your blessing, like “tithe a tenth of your earnings to my cult” or “spend eight hours a day writing,” which ends this Boon immediately if it is not met.

This Boon is free to use on trivial targets.`,
	clash: '',
  },
  {
    title: 'ANIMAL ASPECT',
    purview: 'BEASTS',
    cost: 'Imbue 1 Legend',
    action: 'Reflexive',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `You choose an animal and emulate one of its iconic traits. Pick one of the following benefits:

    <b>Mobility</b>: You can swim like a dolphin, burrow like a termite, or emulate flight with graceful leaps. You can ignore any dangerous or difficult terrain, barriers, or hazards that form of movement could reasonably bypass.

    <b>Senses</b>: Choose a specific circumstance in which the animal’s senses give an advantage — an eagle’s eyes can see clearly from far away, a bat can echolocate in total darkness, while a dog can track by scent for miles. You have Enhancement 3 on sense-based rolls where that advantage applies.

    <b>Other</b>: Pick a miscellaneous trait, like an octopus’s camouflage, an anglerfish’s bioluminescence, etc. You either have Enhancement 2 on actions that trait benefits, or ignore up to 3 points of Complication it negates, whichever best represents the chosen trait.`,
  },
  {
    title: 'LEADER OF THE PACK',
    purview: 'BEASTS',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'Indefinite',
    subject: 'Self',
    mechanics: `You can speak to and understand all animals.

  Animals that don’t have a Legend rating treat their Attitude towards you as one point higher when determining whether you can persuade them to take on a task. This does not stack with other magical Attitude bonuses.

  Once you reclaim the Legend from this Boon, your animal helpers will still try to complete your requests, but may become distractible or less reliable, at the Storyguide’s discretion.`,
  },
  {
    title: 'TOOTH AND CLAW',
    purview: 'BEASTS',
    cost: 'Imbue 1 Legend',
    action: 'Reflexive',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `Choose an animal whose natural ferocity you wish to evoke. Your brawling attacks gain the Lethal tag and up to three points of other weapon tags appropriate to the chosen animal, such as Grappling and Piercing for an alligator’s bite or Pushing and Piercing for a rhino’s charge.`,
  },
  {
    title: 'DRAW BACK THE MASK',
    purview: 'BEAUTY',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Condition',
    subject: 'One character or multiple trivial characters',
    mechanics: `You can bestow blessings that reveal a person’s true beauty, or curses that mar them with ugliness.

  Your blessing or curse takes the form of a Condition imposed on one character, or on all trivial targets within range. Using this Boon on trivial targets is free.

  A blessed character may use their beauty once per scene to add Enhancement 2 on any roll made with a Social Attribute. This Condition resolves once its benefit has been applied a total of your (Legend + 1) times.

  A cursed character suffers a +2 Complication on all Social rolls where their distorted appearance is a disadvantage. This Condition can be resolved by making a sincere and heartfelt apology to someone the target has wronged in a significant way, or with curse-breaking magic.`,
  },
  {
    title: 'LASTING IMPRESSION',
    purview: 'BEAUTY',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Indefinite',
    subject: 'One character or multiple trivial characters',
    mechanics: `You know how to flaunt your looks to kindle an irresistible infatuation.

  This takes the form of a Condition that you can impose on either a single target, or on all trivial targets within range. The Condition raises the target’s Attitude towards you by two points, which does not stack with other magical Attitude bonuses.

  It can be resolved by enjoying a moment of physical intimacy (e.g. sex, a passionate kiss, a really good hug) with you, or when you reject the target’s advances.

  Reclaiming the Legend imbued in this Boon also resolves the Condition.`,
  },
  {
    title: 'VISAGE GREAT AND TERRIBLE',
	purview: 'BEAUTY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `The line between beauty and monstrosity is drawn by your hand. Your very appearance instills your enemies with the absolute terror of confronting your divinity.

Trivial targets automatically flee from you, while other characters face a +2 Complication on any action that does not somehow help them flee your presence.`,
	clash: '',
  },
  {
    title: 'HORNET’S NEST',
    purview: 'CHAOS',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'One scene',
    subject: 'Multiple characters',
    mechanics: `You create an instant riot.

  All trivial characters in range, plus up to (Legend x 3) non-trivial mortals, will stop whatever they’re doing and create a wild and disruptive frenzy, mob, or protest — whichever is most appropriate to the circumstances.

  If the Storyguide has specific plans for what a mortal character is doing in the scene (for example, the hired security you’re trying to distract with a riot), she can declare them unavailable as targets.

  You have no control over the mob, but they’re reckless and loud and provide a good distraction.`,
    clash: '',
  },
  {
    title: 'NO MASTERS',
    purview: 'CHAOS',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'One scene',
    subject: 'One character',
    mechanics: `You strip a character of their authority over others.

  This suppresses any positive Attitudes or Bonds that any other character within long range has towards the target based on any kind of political, social, or economic authority he holds over them for the duration of the scene.

  Negative emotions are unaffected — employees may lose all loyalty they have to their boss, but they’ll still carry the resentment from long hours or shitty wages.

  Using this Boon on a trivial character is free.`,
    clash: 'Manipulation + Legend vs. Composure + Legend',
  },
  {
    title: 'OVERWHELMING CHAOS',
    purview: 'CHAOS',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'One scene',
    subject: 'One machine or one character',
    mechanics: `You overload a machine’s gears or a person’s mind with concentrated entropy.

  A targeted character must struggle simply to maintain coherent thought. On each turn, if they wish to take an action, they must combine it with a Stamina + Athletics roll at Difficulty 2. 

  Nontrivial characters are rendered catatonic for the scene.

  Machines up to the size of a car can be targeted, breaking down completely until they receive maintenance. This damage is permanent, but the Scion cannot reclaim the Legend imbued in this Boon until the next scene.`,
    clash: '',
  },
  {
    title: 'BLINDING VEIL',
    purview: 'DARKNESS',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'One scene',
    subject: 'Multiple characters',
    mechanics: `You can strip away the vision of any number of characters in range, imposing a blinded Condition on them for one scene.

  If you choose only trivial targets to blind, using this Boon is free.`,
  },
  {
    title: 'DREAM WEAVER',
    purview: 'DARKNESS',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Long',
    duration: 'Until next sleep',
    subject: 'One character',
    mechanics: `You shape a dream, and send it after someone you know — not necessarily personally, but at least well enough to provide a unique description.

  The next time that character goes to sleep, this Boon triggers. You can make an influence roll against the target by shaping and controlling the events and appearance of their dream.

  You choose how you appear in their dream, which may allow you to avoid a negative Attitude towards you or exploit a Bond or Attitude towards another character.

  If you appear as yourself, the intimacy of the dream still raises their Attitude by one point. This doesn’t stack with other magical Attitude bonuses.`,
  },
  {
    title: 'NIGHT’S CARESS',
	purview: 'DARKNESS',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Short',
	duration: 'One scene',
	subject: 'One character or multiple trivial characters',
	mechanics: `You can lull a character to sleep over the course of a few seconds, as long as they are not in combat or a similarly high-stakes situation. 

They remain asleep until at least the end of the scene unless attacked by enemies or magically awakened.

You can put multiple trivial targets to sleep as long as they are in this Boon’s range, and can do so even in combat.`,
	clash: '',
  },
  {
    title: 'UNQUIET DEAD',
    purview: 'DEATH',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'Indefinite',
    subject: 'One corpse or ghost',
    mechanics: `You can cause a corpse to speak, or summon a person’s ghost, shade, or other culturally appropriate remnant (Scion: Origin, p. 31) from the site of their grave for one scene.

  The corpse or shade cannot act except to speak, but you can try to influence it just like anyone else. It starts with Attitude 3 towards you. The undead retains all memories it had in life, except for a blank space of about five minutes leading up to the time of their death.

  As long as you imbue Legend in this boon, the undead’s answers provide Enhancement 3 on any applicable rolls, such as tracking down the person who killed them.

  You can only use this Boon on the same undead once per session.`,
  },
  {
    title: 'THE WAY OF ALL FLESH',
    purview: 'DEATH',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'One scene',
    subject: 'One character',
    mechanics: `You sap a character’s life force.

  All attacks against this gain the Aggravated tag for one scene. When they take damage, they treat their (Defense + Armor) total as one point lower than it actually is to determine the Injury Complication.

  <b>Alternatively</b>, this Boon can be used to destroy or banish all trivial undead targets in range in an instant. Doing so is free.`,
  },
  {
    title: 'YOUR FAULT',
    purview: 'DEATH',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Condition',
    subject: 'One character',
    mechanics: `You burden a character with the guilt of knowing they were responsible for the last death they witnessed (attending a funeral or reading about a death in the media counts). 

  This is a Condition, with precise effects that depend on that character’s personality and their relation to the deceased. A political activist who feels responsible for assassinating an opposition party candidate might have a hard time not bragging about it, while someone who thinks they let the love of their life die will be devastated.

  As a default, the Condition increases the difficulty of all actions that character takes by +2, except actions that have the potential to harm them or otherwise traumatically expiate their guilt.

  The Condition resolves when the affected character confesses their responsibility to someone who trusts them or when you reclaim the Legend imbued in this Boon.`,
  },
  {
    title: 'EPHEMERA',
    purview: 'DECEPTION',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Indefinite',
    subject: '',
    mechanics: `You create an illusory image of a person, animal, or object, up to the size of a car.

  The illusion is lifelike and seems completely authentic — a person breathes, a car’s engine throbs, a fire gives off heat — but it has no physical substance and cannot exert force or cause harm. It can move, but must remain within this Boon’s range.

  A non-trivial character who wins the Clash of Wills can see through the illusion.

  Attempts to touch or physically interact with an illusion go right through it, letting anyone who sees this recognize it as unreal in the absence of extraordinary circumstances.`,
    clash: 'Manipulation + Legend vs. Cunning + Legend',
  },
  {
    title: 'FALSE HISTORY',
    purview: 'DECEPTION',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Close',
    duration: 'Indefinite',
    subject: 'One character',
    mechanics: `You can make a single, discrete change to the substantive content of a character’s memories of the last five minutes or so, such as “<i>me and my friends were never here,</i>” “<i>all you saw were some feral dogs,</i>” or “<i>the room you were in was ornately furnished.</i>”

  Once you reclaim the Legend, their memory reverts to normal.

  You can alter trivial characters’ memories permanently, and only need to imbue Legend until the end of the scene to do so.`,
    clash: 'Manipulation + Legend vs. Resolve + Legend',
  },
  {
    title: 'WALK UNNOTICED',
	purview: 'DECEPTION',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You slough off your identity and vanish.

You do not become literally invisible — instead, people’s minds simply fail to process any distinguishing information about you.

A non-trivial character that wins the Clash of Wills can see through this, but still cannot distinguish your identity or any identifying features, and faces a +3 Complication on rolls to notice you.`,
	clash: 'Manipulation + Legend vs. Cunning + Legend',
  },
  {
    title: 'SHAPING HAND',
	purview: 'EARTH',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You can shape and mold stone, metal, and other earthen substances with your bare hands as though it were as malleable as clay. 

When this assists in an action, like climbing a sheer cliff overhang or pulling a steel wall open, you gain Enhancement 3.`,
	clash: '',
  },
  {
    title: 'SKIN LIKE STONE',
	purview: 'EARTH',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Your soft armor rating increases by one.

If you aren’t wearing any armor (or other protective gear that provides a soft armor rating), it increases by three instead.`,
	clash: '',
  },
  {
    title: 'STONY HEART',
	purview: 'EARTH',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: 'Short',
	duration: 'One scene',
	subject: 'Self or one character',
	mechanics: `You can harden someone’s heart, setting them in their ways against impassioned pleas for help or sweet words of seduction.

This imposes a +3 Complication on any Social actions targeting the character whose heart was hardened, unless the Storyguide determines that the interaction is completely devoid of any appeal to emotion.

She can use this Boon on herself or her allies to fend off the blandishments of others, or use it to undermine other character’s attempts at intrigue.`,
	clash: '',
  },
  {
    title: 'THE FALLING STAR ',
	purview: 'EPIC DEXTERITY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Your speed is a powerful asset in battle. In combat, you can use your reflexive Move action to cross two range bands, and gain Enhancement 3 on rolls to Disengage.

You cannot take damage from falling.`,
	clash: '',
  },
  {
    title: 'HEAVENLY STRIDE',
	purview: 'EPIC DEXTERITY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You can cross great distances in a scant matter of minutes, zooming past passersby in a blur of motion.

Add Enhancement 3 on Rush actions and any action you take in a race.

Once per scene, you may make a Feat of Scale to enhance any action based on physical speed without having to pay a point of Legend.`,
	clash: '',
  },
  {
    title: 'UNERRING FLIGHT',
	purview: 'EPIC DEXTERITY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: 'Self',
	mechanics: `In your precise hands, ranged weapons become extraordinarily deadly.

You may make a ranged attack against any enemy in your line of sight, even out to extreme range.

You can roll the attack with Dexterity in place of the Attribute normally associated with that range band, and do not face an increased difficulty for using weapons with the Ranged or Long Range tag at any range band.

You can use this boon to attack an enemy behind full cover.`,
	clash: '',
  },
  {
    title: 'ADAMANT BODY',
	purview: 'EPIC STAMINA',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Your skin becomes as hard as adamant, granting you +1 soft armor and the benefit of the Resistant armor tag against a specific type of damage, such as bullets, fire, or acid.

When you purchase this boon, choose one kind of damage that you are naturally resistant to. You can use it to resist the chosen damage type without having to imbue Legend in it.`,
	clash: '',
  },
  {
    title: 'PUT YOUR BACK INTO IT ',
	purview: 'EPIC STAMINA',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Until complete',
	subject: 'Self',
	mechanics: `You labor with tenfold endurance, enhancing a Complex action to perform strenuous physical labor or other exercise.

Any time you roll a Physical Attribute as part of the action, you may roll two times, keeping the higher result.`,
	clash: '',
  },
  {
    title: 'UNBREAKABLE ',
	purview: 'EPIC STAMINA',
	cost: 'Spend 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: 'Self',
	mechanics: `You are beyond injury. When you are hit and an enemy uses an Inflict Damage Stunt, spend 1 Legend to negate it.

This Boon can also be used to defend against being affected by any other Condition based on debilitating injury or physical incapacity, such as a Severed Limb or Broken Spine.`,
	clash: '',
  },
  {
    title: 'HEAVY LIFTER',
	purview: 'EPIC STRENGTH',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Add Enhancement 3 on rolls to lift or carry heavy objects.

When you attack by throwing an improvised weapon, the range increases by a single band,  and it gains the Arcing tag. You choose whether it’s Bashing or Lethal.`,
	clash: '',
  },
  {
    title: 'A WORLD OF GLASS',
	purview: 'EPIC STRENGTH',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You are capable of tearing down walls, ripping up concrete, or rendering brick structures to powder in moments.

Once per scene, you may make a Feat of Scale to enhance any Might-based action without having to pay a point of Legend.`,
	clash: '',
  },
  {
    title: 'PISTONS FOR FISTS',
	purview: 'EPIC STRENGTH',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Your Close Combat and Athletics attack rolls strike with incredible force.

On a hit, you can either send an opponent flying back one range band, or knock him prone.

Felled enemies must succeed on a Dexterity + Athletics roll at Difficulty 3 to Rise from Prone even if you are not threatening them.

This attack can scatter a group of trivial targets, gaining the Shockwave tag as long as all characters in the targeted range band are trivial.`,
	clash: '',
  },
  {
    title: 'BLESSED HARVEST',
	purview: 'FERTILITY',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Close',
	duration: 'Condition',
	subject: 'One character',
	mechanics: `You can confer great vitality on another character with the fruits of Fertility.

To use this Boon, you must prepare a meal that your target eats, offer them support in a familial role, or share a moment of physical intimacy.

This blessing takes the form of a Condition. Once per scene, the target may call upon the blessing to add Enhancement 3 on a roll made with a Force or Resilience Attribute. This Condition resolves once its benefit has been applied a total of (your Legend + 1) times.

A Scion who benefits from this condition may call on it to undertake a Feat of Scale without having to spend a point of Legend. Doing so resolves the condition.`,
	clash: '',
  },
  {
    title: 'HAND OF BLIGHT',
	purview: 'FERTILITY',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Condition',
	subject: 'One character or multiple trivial characters',
	mechanics: `Invoking the negative aspects of Fertility, you afflict your target with a curse of uncontrolled growth, causing them to develop spontaneous cancers and malignant growths.

They suffer the Blighted Condition, adding +2 Difficulty on all physical actions they attempt. 

Resolving this Condition requires magical healing or extensive mundane treatment such as a course of chemotherapy.

This Boon can be used to target multiple trivial characters within range for free.

At your option, trivial targets may die on the spot from agonizingly rapid cancerous growth over the course of the scene.`,
	clash: '',
  },
  {
    title: 'FAVOR OF NATURE',
    purview: 'FERTILITY',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Close',
    duration: 'Indefinite',
    subject: 'One piece of land or one family',
    mechanics: `Yours is the power to bless or blight, granting or withholding the nature’s favor at your whim.

  This Boon can be used on a contiguous piece of land that is recognized as a single locale by human reckoning — “the Hampstead Farm” or “this forest” would be valid targets, but “the 312 acres of land around me” would not.

<b>Blessed land</b> rapidly blooms with plant life, undergoing a rapid surge of growth over a matter of seconds, and eventually an entire growing season’s worth of development over the course of a week. The land remains fertile enough to provide Enhancement 3 on rolls to cultivate or harvest it for (Legend x 10) years after this Boon ends.

  <b>Blighted lands</b> undergo rapid decay. Crops become inedible instantly, and almost all plant life dies out within a week. Structures made from wood or other plant-based materials decay as well, suffering a single level of Health damage each day (or rotting damage sufficient to reduce it to a ruin within two weeks). The blighted land remains infertile for (Legend x 10) years after this Boon ends.`,
    length: 'very',
    continues: true,
  },
  {
    title: 'FAVOR OF NATURE',
	purview: 'FERTILITY',
	mechanics: `You can use this Boon on a family. You must target a single member of the family, and can only affect characters that are their direct ancestors, direct descendants, or are married or otherwise joined to the targeted character. A grandfather, daughter, or husband would all be affected, but a cousin or sisterin-law would not be.

All members of a blessed family have Enhancement 2 to resist poison or disease. They never suffer from infertility or complications relating to pregnancy. Any children conceived or born during this Boon’s duration are hale and hearty, guaranteed to survive through adolescence unless harmed by unnatural causes. Such children often have a sensitivity or affinity for the supernatural and are likely to grow up to become Prophets or Saints, or even Scions.

A blighted family suffers from total infertility. They are unable to conceive children, and any ongoing pregnancies end in miscarriage. Weaker members of the family — usually children or the elderly — that are trivial targets will most likely die of natural causes within a day, capable of being prevented only through intensive medical care throughout the duration of this Boon.`,
    isContinued: true,
  },
  {
    title: 'HEAVEN’S FIRE',
	purview: 'FIRE',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You gain the ability to attack enemies with fire. 

Each Scion can choose a unique manifestation of Fire for their attack: throwing firebolts, heat ray vision, triggering spontaneous combustion with an incantation or a finger snap, etc.

You can make these attacks as Simple actions for the scene, rolled with Athletics + Dexterity. 

They have the Aggravated, Ranged, and Pushing tags.`,
	clash: '',
  },
  {
    title: 'ETERNAL FLAME',
	purview: 'FIRE',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Indefinite',
	subject: 'One fire',
	mechanics: `You imbue a fire with a spark of your divine power, making it a part of yourself.

The flame expands, spreading out to the size of a large campfire if smaller. It burns indefinitely without needing additional fuel and can’t be extinguished by non-magical means.

As a Simple action, you can extend your senses through the fire, letting you see, hear, and smell things as though you were there. 

Previous uses of this Boon end if you use it to bless a new fire.`,
	clash: '',
  },
  {
    title: 'MUSE OF FIRE',
    purview: 'FIRE',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Varies',
    subject: 'One character',
    mechanics: `You inspire another character with flames of enlightenment and creativity.

  The next Cunning, Presence, or Intellect roll they make gains Enhancement 3.

  However, if they don’t find the opportunity to make an applicable roll before the end of the scene, the inner fire overwhelms them, imposing a Condition that raises the difficulty of any Social or Mental actions by 1 unless that character is completely open and honest about everything on their mind.

  Expressing a deeply personal truth, a potentially provocative opinion, or something similarly inflammatory resolves the Condition.`,
    clash: '',
  },
  {
    title: 'CELESTIAL ARTIFICE',
    purview: 'FORGE',
    cost: 'Imbue 2 Legend',
    action: 'Reflexive',
    range: '',
    duration: 'Until complete',
    subject: 'Self',
    mechanics: `You lower the Tier of a crafting project (Scion: Origin, p. 76) by 1. <i>This doesn’t let you undertake projects of a Tier you normally couldn’t accomplish.</i>
    
    <b>Tier 1 (Mortal):</b> Mundane items like swords, improvised explosives, or cars, which usually offer a +1 Enhancement to a specific challenge.
    
    <b>Tier 2 (Hero):</b> Lesser mystical tools, like lucky charms or sleep potions.

    <b>Tier 3 (Demigod):</b> Extraordinary objects equivalent to Relics with ratings of 1-3, like Fae-Shot or the Green Dragon Crescent Blade. 

    <b>Tier 4 (Divine):</b> Legendary wonders, such as Relics rated 4+.
    `,
  },
  {
    title: 'RECLAIM FROM RUIN',
	purview: 'FORGE',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Until complete',
	subject: 'Self',
	mechanics: `You can repair an item no matter how badly it is ruined.

You can recreate items from their remains alone, up to the level of outright reversing entropy — reconstructing a burnt book from a pile of ashes, repairing a sword melted to slag by a dragon’s fiery breath, or retrieving files from a hard drive that’s been through a nuclear detonation.`,
	clash: '',
  },
  {
    title: 'WHILE THE IRON IS HOT',
	purview: 'FORGE',
	cost: 'Spend 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: 'Self',
	mechanics: `Where others see a box of scraps, you see potential.

Add Enhancement 3 on a roll to jury-rig a craft project.

You can roll to rig together contraptions that a mortal would normally be unable to attempt due to feasibility constraints.

As long as it is notionally possible that you could complete the project with (Legend) days of ordinary work, you can roll to attempt it.`,
	clash: '',
  },
  {
    title: 'DIVINATION',
    purview: 'FORTUNE',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Condition',
    subject: 'One character',
    mechanics: `You divine a character’s luck in the near future.

    Out of character, you decide whether they will enjoy good or suffer bad luck as a Condition. 

    Once per scene, before that character makes a roll, you can declare that their luck intervenes — good luck lowers the target number by 1, while bad luck increases it by 1.

    You can invoke their luck even if your character is not in the scene.

    A character’s good luck runs out once this benefit has been applied a total of your (Legend + 1) times.

    Bad luck runs out at the end of a scene where a failure on the penalized roll led to significant consequences, or if the victim accepts a botch offered by the Storyguide on any action.`,
  },
  {
    title: 'FATEFUL CONNECTION',
    purview: 'FORTUNE',
    cost: ' 1 Legend',
    action: 'Simple',
    range: 'Infinite',
    duration: 'Instant',
    subject: 'One character Fatebound to you',
    mechanics: `You invoke the Fatebinding of a character tied to you to cause them to appear in the narrative and provide a benefit based on their Fatebinding role, without it counting against the usual once per episode limit.

  Synchronicity arranges for that character to be near enough to arrive rapidly with a completely plausible explanation — maybe they’re visiting their family, or stalking you, or their plane had to make an emergency landing nearby.

  If the Storyguide agrees, this can even bring characters into Terra Incognitae and other realms of existence (maybe they tripped through a portal).`,
    clash: '',
  },
  {
    title: 'NINE LIVES',
    purview: 'FORTUNE',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `Your luck is strong enough to survive impossible accidents and deadly firefights.

  You add +1 Defense against attacks and have Enhancement 2 on any roll where you could suffer physical harm as a direct result of failing it.`,
    clash: '',
  },
  {
    title: 'FLASH FREEZE',
	purview: 'FROST',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Instant',
	subject: 'All enemies in one range band',
	mechanics: `You can drain away the heat of the world, icing over landscapes and freezing enemies from the inside out.

Roll this as an attack using (highest Power Attribute) + Occult. It has the Bashing, Piercing, Ranged, and Shockwave tags.

All water in the targeted range band is also instantly frozen solid.

Ground becomes iceslick difficult terrain, bodies of water freeze over, pipes burst, etc.`,
	clash: '',
  },
  {
    title: 'GLACIAL PACE',
    purview: 'FROST',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Indefinite',
    subject: 'One character, or multiple trivial characters, or multiple objects',
    mechanics: `Things slow to a halt as you strip away the speed from the world.

  If you use this Boon on a character that has Scale with regard to speed, like a cheetah or a Scion using a Feat of Scale, their Scale is reduced by one.

  Characters without Scale add +2 Difficulty to all rolls based on physical speed.

  <i>This Boon can be used against all trivial opponents in range for free.</i>

  <b>Alternatively,</b> you can slow any number of moving objects of the same general type within this Boon’s range, reducing their Scale with regards to speed by one.`,
  },
  {
    title: 'COOLER HEADS',
    purview: 'FROST',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'One scene',
    subject: 'Multiple characters',
    mechanics: `When tempers flare and action comes before thought, you can cool things down.

    This Boon can be used against characters engaged in combat, intense argument, reckless decision making, or similar emotionally agitating scenarios.

    They grow cold-hearted, almost emotionless. Whatever they were doing, they stop, and won’t return to it for the rest of the scene — they’ll walk away from brawls, take a moment to reconsider whether they should be having an emotional argument, take the time to think their plans through more thoroughly, or similar. They can still defend themselves if others try to harm them, but will not initiate any kind of hostilities.`,
    clash: 'Composure + Legend vs. Presence + Legend',
  },
  {
    title: 'FLAWLESS DIAGNOSIS',
	purview: 'HEALTH',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Ask the Storyguide one of the following questions:

<ul><li>What’s wrong with this person, and how could I help them?
<li>What were this person’s last moments like?
<li>How can I end this [disease outbreak, mass poisoning, or similar crisis]?
<li>Who is responsible for this harm?
</ul>
Following the Storyguide’s answer grants Enhancement 3 on applicable rolls.`,
	clash: '',
  },
  {
    title: 'HEALING HANDS',
	purview: 'HEALTH',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Close',
	duration: 'Instant',
	subject: 'One character',
	mechanics: `Touching a character, you heal their wounds. 

This Boon can be used to instantly resolve any Injury Condition a target suffers from, even Maimed Conditions.

You can also use this Boon to resolve Conditions such as Poisoned, Disease, or similar ailments of physical or mental health, even if they are inflicted by magic`,
	clash: '',
  },
  {
    title: 'MASTER OF DISEASE',
	purview: 'HEALTH',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Condition',
	subject: 'One character',
	mechanics: `You can withhold the benefits of Health from your foes, magically inflicting disease upon them.

This imposes both a +5 disease Complication and the Divine Plague Condition. Until the Condition is resolved with magical healing, the target cannot buy off the Complication or have it treated mundanely.

A mortal target who fails to resolve the Condition within (12 − Legend) months suffers automatic death.`,
	clash: '',
  },
  {
    title: 'CHARIOT OF THE GODS',
	purview: 'JOURNEYS',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: 'Close',
	duration: 'One scene',
	subject: 'One vehicle',
	mechanics: `You imbue a vehicle with divine power, raising the Scale of all speed-based actions taken with it by 1.

Opposing characters that try to steal, damage, or otherwise impede your chosen chariot face a +2 Complication.`,
	clash: '',
  },
  {
    title: 'UNBARRED PASSAGE',
	purview: 'JOURNEYS',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: 'Medium',
	duration: 'One scene',
	subject: '',
	mechanics: `You can negate a single Complication that obstructs your travel.

Locked doors open at a touch, traffic parts around your car, and rough patches of turbulence disperse as the plane you’re on flies through them.

This benefits not only you, but any other character traveling with you.`,
	clash: '',
  },
  {
    title: 'HERE THERE BE DRAGONS',
	purview: 'JOURNEYS',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Indefinite',
	subject: 'One character',
	mechanics: `You strew obstacles before an enemy’s path. 

Any time they roll to travel or navigate, the Storyguide inflicts a +3 Complication on the roll — parades in the way of their morning drive, flights delayed by mechanical troubles, and so on.

If the character is attempting to move across difficult terrain that already exists, your curse also increases the difficulty of their movement actions by +1.`,
	clash: '',
  },
  {
    title: 'ENCHANTING EVENING',
    purview: 'MOON',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Indefinite',
    subject: 'One character',
    mechanics: `Cast in the light of the moon, things that once seemed familiar take on new meanings and reveal hidden beauty.

  The target of this Boon reconsiders their feelings for someone or something they see, gaining Attitude 2 towards the designated person or thing, or changing the rating of an existing Attitude by +2 or −2.

  The target’s player chooses the exact nature of their change of heart — this Boon simply forces them to make a change.

  This doesn’t stack with other magical Attitude modifiers, but can cancel out an opposing bonus or penalty.`,
    clash: 'Manipulation + Legend vs. Resolve + Legend',
  },
  {
    title: 'PHASE CLOAK',
    purview: 'MOON',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `You vanish into ephemeral darkness, becoming completely invisible.

  You have Enhancement 3 to avoid being seen. 

  This applies against electronic surveillance and even magical scrying based on sight.`,
  },
  {
    title: 'THREE-FACED MOON',
    purview: 'MOON',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Indefinite',
    subject: 'Self or one character',
    mechanics: `Drawing on symbolic ties between the waxing and waning of the moon and the cycle of human age, you transform your appearance or someone else’s.

  You may change their apparent age, making them seem younger or older as you choose. This does not physically age the target’s body, although they may face age-based Complications on Social actions.

  If you use this Boon on yourself, you gain a bonus on rolls with a specific Skill depending on your apparent age:

<span class="indent"><b>Youth:</b> As a young child, you seem full of innocence, adding Enhancement 2 on Empathy rolls.</span>
<span class="indent"><b>Adult:</b> As a mother or father, you provide comfort, adding Enhancement 2 on Medicine rolls.</span>
<span class="indent"><b>Elder:</b> You know the secrets of your people, adding Enhancement 2 on Occult rolls.</span>`,
  },
  {
    title: 'CODE OF HEAVEN',
	purview: 'ORDER',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `When you explain laws to people, as long as you’re truthful and accurate, they know that you are correct.

If, as part of your explanation, you declare a person or group to be innocent, then the protection of this Purview’s innate power extends to them for this Boon’s duration.

On the other hand, if you condemn someone as guilty, you and those who hear you have Enhancement 2 on any actions taken to bring them to justice.`,
	clash: '',
  },
  {
    title: 'DIVINE RIGHT',
	purview: 'ORDER',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Close',
	duration: 'One scene',
	subject: 'Self or one character',
	mechanics: `You anoint yourself or another character as divinely proclaimed sovereign, making all who look upon them see proof of their immanent authority.

All characters treat their Attitude towards the sovereign as 1 point higher. This doesn’t stack with other magical Attitude bonuses.

In addition, for the purpose of Order Boons and marvels that care, such as Code of Heaven (p. 256), it is unlawful to harm or betray the sovereign.`,
	clash: '',
  },
  {
    title: 'NOTHING BUT THE TRUTH',
	purview: 'ORDER',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Short',
	duration: 'Indefinite',
	subject: 'One character',
	mechanics: `Your imposing presence strikes divine terror into the hearts of liars.

An affected character can’t lie, omit the truth, or make any misrepresentation of a material fact, and consequently never imposes a misleading Complication on any information they give.`,
	clash: 'Presence + Legend vs. Manipulation + Legend',
  },
  {
    title: 'BLURT IT OUT',
	purview: 'PASSION',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Short',
	duration: 'One scene',
	subject: 'One character',
	mechanics: `You overwhelm a character with a sudden burst of emotion. They exclaim without realizing it, unwittingly vocalizing whatever they are thinking. 

Everyone who hears it gains Enhancement 3 on Assess Attitude actions or other Social rolls to understand the utterance’s context for the duration of the Boon.`,
	clash: 'Presence + Legend vs. Composure + Legend',
  },
  {
    title: 'IRRESISTIBLE IMPULSE',
    purview: 'PASSION',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Condition',
    subject: 'One character',
    mechanics: `You fill a character’s heart with an emotion of your choice. They gain a Condition based on that emotion — Mad as Hell, Lovestruck, Too Sad to Function, or something similar. The exact effect of the Condition may vary based on the chosen emotion, but as a generic effect, the target takes +3 Difficulty when they take an action that the Storyguide deems is directly contrary to the emotion — it’s hard to treat someone politely while Mad as Hell, or to commit to a fist fight while Lovestruck.

Other characters gain Enhancement 3 on rolls to detect the inflamed emotion.
This Condition can be resolved by taking a significant action with the potential for consequences that is motivated by the emotion — starting a bar fight, asking someone out, or skipping work would count.

It also ends if you reclaim the Legend imbued in this Boon.`,
  },
  {
    title: 'TUGGING AT HEARTSTRINGS',
    purview: 'PASSION',
    cost: 'Imbue 1 Legend',
    action: 'Reflexive',
    range: 'Long',
    duration: 'One scene',
    subject: 'One character',
    mechanics: `Once you have identified a character’s Attitude towards you or someone else, you can either intensify or stifle the emotions from which it is derived, raising or lowering its value by 1 point.

  This doesn’t stack with other magical Attitude modifiers, but can cancel out an opposing bonus or penalty.`,
    clash: '',
  },
  {
    title: 'ALL THAT GLITTERS',
    purview: 'PROSPERITY',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Close',
    duration: 'One session',
    subject: 'One object or location',
    mechanics: `You never have to worry about your wealth or gifts going unnoticed.

  You can use this Boon on either a luxury good that you’ve bought this session, like an elegant necklace or brand-new SUV, or an object or locale that you have either concretely or symbolically dedicated to a group of people, like a shrine built for your cult or a shopping mall you’ve cut the ribbon to.

  The blessed object or location catches the attention of anyone who sees it, and provides Enhancement 2 to influence that plays off a character’s feelings towards it.

  You could use your shiny new jewelry to seduce a handsome-but-penniless bachelor, or give it away to an enemy, and then convince a crew of notorious thieves to rob their house once they’ve seen the goods.`,
  },
  {
    title: 'BLESSED WEALTH',
    purview: 'PROSPERITY',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'Instant',
    subject: '',
    mechanics: `You call forth wealth, conjuring up roughly $10,000 worth of riches (though you don’t need to bother keeping track of precise sums). This wealth takes the form of your choosing: a fresh wad of $100 bills in your wallet, coins of precious metal minted with your divine parent’s visage, a discreet deposit into your online bank account, or similar.

  Regardless of the form it takes, money conjured with this Boon wants to be spent — any that remains in your possession once the session ends vanishes.

The money retains your blessing once it has been given away, giving a mortal Enhancement 3 on a single roll to run a business successfully or maintain a comfortable home and lifestyle (above and beyond the usual benefits of having money to spend).

If it becomes divided among multiple characters, only the first one to roll gets the Enhancement.`,
  },
  {
    title: 'DIVINE PROVIDENCE',
    purview: 'PROSPERITY',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Long',
    duration: 'Indefinite',
    subject: 'One group or city',
    mechanics: `You give your blessing to a specific group of mortals that belong to an organization or live in the same place, such as the employees of a business, the members of your cult, or the populace of a city.

  Your benevolence wards away economic misfortune, negating any mundane Conditions that arise from poverty or stabilizing larger-scale economies. A blessing on a city’s homeless population ensures they will fortuitously find enough resources to maintain their basic needs of sustenance and accommodation, while your favored city will weather recessions or other misfortune slightly better than others in the region.

  If you have a relationship to the group or city that benefits from this that is represented by a Path, you can evoke that Path an additional time each session.`,
  },
  {
    title: 'BOLT FROM THE BLUE',
	purview: 'SKY',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'Instant',
	subject: 'All enemies in one range band',
	mechanics: `You call down a bolt of lightning, rolling an attack with (highest Power Attribute) + Occult. 

It has the Aggravated, Ranged, and Shockwave tags.

You can use this Boon to attack enemies inside a building, but it provides a Defense bonus: from +1 for a one-story building with a light wooden roof to +5 for a sky- scraper with a lightning rod affixed to it.`,
	clash: '',
  },
  {
    title: 'FLIGHT',
	purview: 'SKY',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `You can fly, using movement actions to ascend upwards into the air or horizontally through it. 

You cannot rush or disengage (<i>Scion: Origin, p. 72</i>) while flying.

When this Boon ends, you descend gracefully to the ground, taking no falling damage.`,
	clash: '',
  },
  {
    title: 'VOICE OF SEVEN THUNDERS',
	purview: 'SKY',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'Indefinite',
	subject: 'Self',
	mechanics: `Your voice booms like a crashing storm.

You can be clearly heard by anyone out to far range, and do not need to spend threshold successes or Legend to use the Esoterica marvel when using your voice.

If you are threatened, the Enhancement you receive is increased by one, maximum 3.`,
	clash: '',
  },
  {
    title: 'COSMIC PERSPECTIVE',
	purview: 'STARS',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `To look up at the stars is to peer into the past, witnessing light that was shed countless eons ago.

You can observe the past, specifying either a point in time or an event that occurred as far back as 1,000 years, but no more recently than the last dawn.

If you use this Boon to make an interval roll for an investigation or a similar action, you can ignore up five points of Complication resulting from the passage of time since the event you view occurred.`,
	clash: '',
  },
  {
    title: 'GUIDING STAR',
	purview: 'STARS',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Infinite',
	duration: 'Indefinite',
	subject: 'One character',
	mechanics: `You create a mystical beacon that leads either directly to you, to the location that you are in when you use this Boon, or to any locale that you know well.

The target of this Boon can sense the beacon from anywhere within the same realm of existence, and can navigate the way to it with a flawless sense of direction.Once a character has chosen to follow the beacon, you can divine their location as a simple action, determining the exact distance and direction to them.`,
	clash: '',
  },
  {
    title: 'STARRY PATH',
    purview: 'STARS',
    cost: 'Spend 1 Legend',
    action: 'Complex',
    range: '',
    duration: 'Instant',
    subject: 'Self and other characters',
    mechanics: `As you focus on a specific location, motes of starlight wink into existence around you. You must maintain your focus as a Complex action as they build over the course of a few minutes, and can’t use this Boon at all while in combat or similarly fast-paced action.

    Once the action is complete, you disappear in a burst of starlight and instantly reappear anywhere in the World, regardless of distance.

    You can bring up to (Legend) additional willing characters with you when you teleport. Other Scions and mortals Fatebound to you don’t count towards this limit.

    This Boon can’t be used to pass directly from one realm of existence into another. In Terra Incognitae, Overworlds, or Underworlds, the distance you can teleport with a single use is limited to the equivalent to five days and nights of travel within that realm.`,
  },
  {
    title: 'BLINDING GLORY',
    purview: 'SUN', cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Condition',
    subject: '',
    mechanics: `You unleash a flash of brilliant light, inflicting a blinding Condition on all enemies in range.

  When you spend Legend with this Purview’s innate power, you may also use this Boon reflexively and for free.

  In addition, if all targets are trivial, this Boon’s cost is waived.`,
  },
  {
    title: 'HOPE REBORN',
    purview: 'SUN',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'One day',
    subject: 'Self',
    mechanics: `You embody the glory of the sun and the promise of the dawn.

  Mortals will instinctively see you as the answer to any hopes they may have, and you have Enhancement 3 when you try to identify these hopes or use them as leverage in influence.`,
    clash: '',
  },
  {
    title: 'PENETRATING GLARE',
	purview: 'SUN',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Your see through the darkness of lies and confusion.

Add Enhancement 3 on any rolls to determine whether a charac- ter is lying, see through a disguise, pierce an illusion, or otherwise see through deceptions.

If you face the Misleading complication, its rating is reduced by one point.`,
	clash: '',
  },
  {
    title: 'HERALD OF VICTORY',
	purview: 'WAR',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Long',
	duration: 'One scene',
	subject: 'One side of a battle',
	mechanics: `Your blessing promises victory. All characters on the side of your choice in a fight (whether physical or not) gain Enhancement 1 on all actions.

If you are passively observing a battle between unrelated parties (i.e. none of her allies are involved), you can use this Boon for free to favor one side.`,
	clash: '',
  },
  {
    title: 'MARCHING ORDERS',
	purview: 'WAR',
	cost: 'Imbue 1 Legend',
	action: 'Reflexive',
	range: 'Short',
	duration: 'One scene',
	subject: 'You or one character',
	mechanics: `You grant Enhancement 2 to yourself or another character on rolls to command Heavy Followers (Scion 2e Hero p.203) for one scene.

If the target interacts with a character who is his subordinate in a military or paramilitary group, the subordinate’s Attitude is treated as one point higher.

This does not stack with other magical Attitude bonuses.`,
	clash: '',
  },
  {
    title: 'UNDERSTANDING THE BATTLEFIELD',
    purview: 'WAR',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `Ask the Storyguide one of the following questions:
    <ul><li>What is the best way to provoke a fight (not necessarily lethal, but definitely ugly) in the current scene?
    <li>What’s the best way out of (or into) this room?
    <li>Where should I look to find a tactical advantage? (e.g. a shotgun beneath the bar, corridors too narrow for a full security squad to move through, a war God’s blessed altar)
    <li>What should I be on the lookout for?
    </ul>
    Following the Storyguide’s answer grants Enhancement 3 on applicable rolls.
    
    This never directly benefits attack or defense — if the Storyguide told you about a machine gun hidden in the scene, you would get an Enhancement to find it and get it, but not to shoot with it.
    `,
  },
  {
    title: 'REBORN IN THE DEPTHS',
    purview: 'WATER',
    cost: 'Imbue 1 Legend',
    action: 'Reflexive',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `You can heal by submerging yourself in a body of water, resolving an Injury Condition at the end of a scene spent immersed in water.

  (You can only benefit from this healing once per session.)

  <b>In addition,</b> you extend your senses through the water. As a simple action, you can displace your perspective to any point out to long range within the same body of water, seeing through that point as though you were physically there.`,
  },
  {
    title: 'CHANGING TIDES',
    purview: 'WATER',
    cost: 'Imbue or Spend 1 Legend',
    action: 'Simple',
    range: 'Long',
    duration: 'Varies',
    subject: 'Body of water',
    mechanics: `You exert your will over water, controlling the tides or currents that move through it.

  You can calm all water out to long range, making it still and placid even in the face of a hurricane, or change the direction that currents flow in, letting you reverse the direction of a river or cause a riptide to drag lost swimmers back to shore.

  Reclaiming the Legend imbued in this Boon causes the water to revert to its natural behavior.

  <b>Alternatively,</b> if you spend Legend instead of imbuing it, you can call up a great wave to crash down on your foes.

  You roll this attack with (highest Power Attribute) + Occult. It has the Bashing, Long Range, Pushing, and Shockwave tags.`,
  },
  {
    title: 'SINK HOPES',
    purview: 'WATER',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Condition',
    subject: 'One character',
    mechanics: `You overwhelm a character with the sensation of endless drowning as a Condition.

  Even though they know they can breathe, they either panic or despair as they feel suffocated by an endless crushing darkness.

  All rolls they make with Social or Mental Attributes are at +2 difficulty.

  If they are submerged in water or at risk of becoming so, this also applies to Physical Attribute rolls.

  This Condition resolves when the target suffers near-drowning or a comparable mortal peril due to water, or when you reclaim the Legend imbued in this Boon.`,
  },
  {
    title: 'OVERGROWTH',
	purview: 'WILD',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'One scene',
	mechanics: `You cause plants to sprout and rapidly grow from the soil, cracks in concrete, or any other surface that can support them.

You can create difficult terrain anywhere within range and create one or more terrain features that provide a total of 3 points worth of Complications or Enhancements.

For the rest of the scene, you direct the plants to attack an enemy as a simple action, rolling Presence + Survival. These attacks have the Bashing, Grappling, and Versatile tags`,
  },
  {
    title: 'CALL OF THE WILD',
    purview: 'WILD',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Medium',
    duration: 'Condition',
    subject: 'One character or multiple trivial targets',
    mechanics: `For all that human civilization has progressed, it is not so far from returning to the wild as it might like to think.

  You can use this Boon on a human, human-like being, or domesticated animal.

  Alternatively, this Boon can be used against all trivial targets within range for free.

  You inflict a Condition that awakens atavistic instincts, adding +2 to the Difficulties of all Academics, Culture, Firearms, Medicine, Pilot, Science, and Technology rolls, but grants Enhancement 2 on Athletics, Close Combat, Integrity, and Survival rolls.

  This Condition resolves when failing a roll with one of the penalized Skills leads to significant consequences.`,
  },
  {
    title: 'LAY OF THE LAND',
	purview: 'WILD',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: '',
	duration: 'One scene',
	subject: 'Self',
	mechanics: `Ask the Storyguide one of the following questions in a wilderness area:
<ul>
<li>What happened here recently?
<li>What should I be on the lookout for? 
<li>Where’s my best escape route/way in/way
around?
<li>What here is useful or valuable to me?
</ul>
Following the Storyguide’s answer grants
Enhancement 3 on applicable rolls.`,
  },
  {
    title: 'TRANSFIGURE',
    purview: 'METAMORPHOSIS',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Instant',
    subject: 'One character',
    mechanics: `You transform another character into an animal or a similar animate form, as long as it does not completely prevent a character from acting or effectively kill them.

  Using this Boon on trivial characters is free, and they can be turned into trees, statuary, or other forms that incapacitate them.`,
    clash: 'Cunning + Legend vs. Resolve + Legend',
  },
  {
    title: 'CHANGE SHAPE',
    purview: 'METAMORPHOSIS',
    cost: 'Spend 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'One scene',
    subject: 'Self',
    mechanics: `You take on a form that is symbolically associated with one of your other Purviews.

      For example, Zeus drew on the associations of the Sky Purview to become all sorts of birds, a shower of gold, and a bull (which sounds a great deal like thunder, up close).

      This transformation is perfect in the details and undetectable through non-magical means, but doesn’t alter any of your Attributes, Skills, or other traits. However, depending on the form you assume, you can gain the following benefits:

      <ul><li>+1 Scale on all actions with a single Physical Attribute of your choice.
      <li>Any special forms of movement that shape possesses.
      <li>Any natural attacks that shape possesses.
      </ul>
      Any miscellaneous abilities the Storyguide decides the shape should have, like a cloud being able to rain.`,
    length: 'long',
  },
  {
    title: 'SPIN THE THREAD',
    purview: 'WYRD',
    cost: 'Imbue 1 Legend',
    action: 'Complex',
    range: 'Infinite',
    duration: 'Condition',
    subject: 'One character',
    mechanics: `You use the art of seiðr to lay a blessing or curse on another character, entering into a ritual trance that lasts one scene and envisioning their future.

  You predict a specific triumph or downfall the character will face, and impose a Condition that represents this destiny on them. If an action is likely to bring about the foretold fate, the Condition provides Enhancement 2. Actions that struggle against this destiny have their Difficulty increased by 1, or by 2 if they would make it outright impossible for it to come to fruition.

These effects cut both ways — a blessing might make it more difficult for a warrior to undertake a plan if it would lead to his defeat, while a curse might give a foe an Enhancement on actions that lead to their downfall.

  This Condition resolves once the outcome you have predicted comes to pass, the Storyguide deems that it is no longer capable of being fulfilled, or you reclaim the Legend imbued in this Boon. It can also be lifted by magic capable of altering destiny, such as marvels of this Purview or the Fortune Purview.`,
    length: 'long',
  },
  {
    title: 'CAST THE RUNES',
	purview: 'WYRD',
	cost: 'Free',
	action: 'Complex',
	range: '',
	duration: 'One session',
	subject: '',
	mechanics: `Once per session, you may perform a divination by casting runes etched onto stones, strips of bark, or other objects in a ritual that takes a handful of minutes to complete.

The Storyguide gives you a lead or a clue about what will happen in the near future (i.e. what they expect to happen in the current session). 

If you use a Boon or marvel later in the same session, and the Storyguide agrees that it will help in bringing about the foretold events, you may draw on the divination to waive the cost of imbuing or spending a single point of Legend.

Each use of this Boon only provides this benefit once.`,
  },
  {
    title: 'DEVOTION’S REWARD',
    purview: 'YOGA',
    cost: 'Free',
    action: 'Complex',
    range: '',
    duration: 'One session',
    subject: 'Self',
    mechanics: `You call upon the power of a Devá through an act of devotion that lasts at least a scene: undergoing austerities, putting on an artistic performance, making sacrificial offerings pleasing to the God (even one’s own limbs), or performing some other passionate act of devotion.
    
    You may choose to gain a specific power or make an open-ended request for a Devá’s favor. If you make a specific request, you must contend with a limitation imposed its use by the Devá — a gift of invulnerability might apply against Gods, Titans, and their progeny, but not against mortals, while a loaned weapon might cease to work if you treat a child with less than full respect. If you make an open-ended request, the Storyguide chooses the power you receive, but it carries no restrictions.`,
    continues: true,
  },
  {
    title: 'DEVOTION’S REWARD',
	purview: 'YOGA',
	mechanics: `Usually, power granted by a Devá comes in the form of one of their Purviews’ Boons, one of their Callings’ knacks, or the temporary usage of one of their Relics, all of which last for one session. The Storyguide can also offer customized blessings. You can’t gain a power beyond your ability to learn normally, such as a God Boon while you are only a Hero.
	
	This Boon can also be used to call upon the favor of an asura (i.e. a Titan that possesses one of the Devá, Pantheon Virtues).
	
	At the Storyguide’s discretion, it is possible to gain the favor of Gods and Titans from other pantheons with this Boon, although you may need to research what would please them or convince them to reciprocate your devotion.`,
	isContinued: true,
  },
  {
    title: 'EYES OF KNOWLEDGE',
    purview: 'YOGA',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'Indefinite',
    subject: 'Self',
    mechanics: `Ask the Storyguide one of the following questions about a God, Scion, Titan, titanspawn, or other divine being you can see:
    <ul>
    <li>What do they intend to do?
    <li>How are they really feeling?
    <li>What do they wish I’d do?
    <li>How could I get them to do [a certain thing]?
    </ul>

The Storyguide should try to give this answer in the form of a spontaneous, in-character poetic speech, villainous monologue, or other form of expository dialogue by the character in question (but they can just give you the answer out of character if that’s too much work). Following whatever guidance this reveals provides Enhancement 3 on applicable rolls for the duration of this Boon.`,
  },
  {
    title: 'APPEASING THE KAMI',
    purview: 'YAOYOROZU-NO-KAMIGAMI',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Indefinite',
    subject: 'One object',
    mechanics: `You entreat the kami of an object with a show of respect and decorum. The object’s Enhancement is increased by one point when you or an ally uses it. When an enemy uses it, they face a +2 Complication. Failure to buy off the Complication causes the object to “misbehave,” avoiding causing harm or disadvantage to you.`,
  },
  {
    title: 'THE WATCHFUL SPIRIT',
	purview: 'YAOYOROZU-NO-KAMIGAMI',
	cost: 'Free',
	action: 'Simple',
	range: 'Close',
	duration: 'Until task is completed',
	subject: 'One kami',
	mechanics: `You can ask the kami of an object or animal to watch for intruders, keep a lookout for a specific person or event, or perform some other passive task. Once the kami finds what it is looking for or otherwise completes its task, it can notify you regardless of distance, either whispering into your ear or sending a divine portent. This warning or sign can provide +2 Enhancement if it benefits an action. If you use this Boon again before the watchful kami has completed its task, its duty is discharged and the previous use of this Boon ends.`,
  },
  {
    title: 'DANCE WITH THE DIVINE',
    purview: 'CHEVAL/GUN',
    cost: 'Imbue 1 Legend',
    action: 'Complex',
    range: '',
    duration: 'Indefinite',
    subject: 'Self',
    mechanics: `You invite one of the Gods of your pantheon to share your body at the end of a scene-long ritual. You choose one of the God’s Purviews, gaining access to its innate powers and marvels. 
    
    Alternatively, you can invite possession by one of your ancestor spirits — called égún by the Òrìshà and ghede by the Loa — to gain the benefits of having them as a Guide. In exchange, the spirit can experience the World vicariously through you, although they won’t actually interfere with your control over your body.

    You can only end this Boon once the spirit is ready to leave you. They never overstay their welcome out of malice, but some will press for just one more meal or one last smoke. The usual method for dealing with these spirits is to go off somewhere calm and quiet with a priest (or one of your bandmates, in a pinch), who can politely ask them to depart.`,
  },
  {
    title: 'MOUNTING THE HORSE',
    purview: 'CHEVAL/GUN',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Long',
    duration: 'One day',
    subject: 'One willing mortal character',
    mechanics: `You send a part of your spirit and consciousness into the body of a mortal who’s willing to share. You can use their senses to experience the world, dictate their actions, and even use your Boons and knacks through them. The mortal remains aware of what’s going on, and can communicate mentally with you. You retain consciousness and control of your body while pos- sessing someone else, and can take actions through either body, sometimes simultaneously: If you’re wrestling a rival Scion while guiding a possessed mortal through a first date, you’ll need to roll for both of them as a mixed action.
    
    This Boon can be used with infinite range — even across realms of existence — if the target is Fatebound to you or is a member of your cult and invites you in with a scene-long ritual.`,
  },
  {
    title: 'DREAM QUEST',
    purview: 'DODAEM',
    cost: 'Imbue 1 Legend',
    action: 'Complex',
    range: '',
    duration: 'Indefinite',
    subject: 'Self',
    mechanics: `As you sleep, your dodaem manitou shows you meaningful visions. Ask the Storyguide one of the following questions: • Where do I need to be? 
    <ul>
    <li>What should I be on the lookout for?
    <li>What is the cause of this problem?
    <li>What is disturbing the dodaem manitou of this area? 
    </ul>
    Following the Storyguide’s answer provides Enhancement 3 on actions that help get you to where you need to be in order to do what you must, but not on rolls to actually do it. If your dreams show you that you must slay a wendigo, the Enhancement would apply on rolls to investigate its victims and track it down, but not to do battle with it.`,
  },
  {
    title: 'SACRED MEDICINE',
	purview: 'DODAEM',
	cost: 'Spend 1 Legend',
	action: 'Complex',
	range: 'Close',
	duration: 'Instant',
	subject: 'One character',
	mechanics: `You tend to someone’s physical, mental, or spiritual health by appealing to their dodaem manitou in a scene-long ritual. 
	
	This can resolve any Condition that character is currently suffering from, including Injury Conditions. However, in exchange for the manitou’s aid, it will request a favor from or impose a restriction on either you or that character (if that character is a PC, the responsibility is almost always on them).
	
	Failure to abide by this request either causes the cured ailment to return in full force, or imposes a Condition that represents the manitou’s disfavor.`,
  },
  {
    title: 'REN HARVEST',
	purview: 'HEKU',
	cost: 'Free',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: 'Self',
	mechanics: `As your name spreads across mortal lips and thoughts, your Legend grows. Once per session, when you hear someone talk about you by name and describe your exploits, you gain 1 Legend. Reading a published written description of your exploits that attributes them to you by name in a newspaper, blog, or other similar document can also trigger this reward.
	
	In order for you to use Ren Harvest, the speaker or writer must be praising you out of genuine awe or admiration. Attempting to coerce or trick someone into praising you won’t trigger it.`,
  },
  {
    title: 'SEKHEM BLAZE',
	purview: 'HEKU',
	cost: 'Imbue 1 Legend',
	action: 'Simple',
	range: 'Medium',
	duration: 'One scene',
	subject: 'One character',
	mechanics: `You manifest the power and energy of your living soul as a brilliant light shining in your eyes, exerting your dominance over all you behold. The target must either flee from, or is cowed into submission and ceases hostilities — your choice. If you know their ren, you treat their Attitude as two points higher for the rest of the scene.
	
	This does not stack with other magical Attitude bonuses.`,
	clash: 'Presence + Legend vs. Resolve + Legend',
  },
  {
    title: 'CELESTIAL PROMOTION',
    purview: 'TIANMING',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Short',
    duration: 'Condition',
    subject: 'Self or one character',
    mechanics: `You name yourself or another with a title imbued with the authority of heaven: “Great Sage, Equal to Heaven,” “Protector of Dogs,” “That One God No One Likes,” or something similar. The bestowed title is a Condition.
    
    The target’s title is self-evident to anyone who meets him, and people who need aid related to the title’s duties will tend to come to them for help.
    
    The title provides Enhancement 2 on rolls to influence characters or form plans whenever the target is able to take advantage of it, but imposes Complication 2 where it incurs the displeasure of those they’re working with — cats don’t like the Protector of Dogs, and no one likes That One God No One Likes.`,
    continues: true,
  },
  {
    title: 'CELESTIAL PROMOTION',
    purview: 'TIANMING',
    mechanics: `A character who finds their title disagreeable can resolve this Condition by undertaking a dramatic action that carries significant potential consequences in the service of their title’s duties, finally releasing themselves from its obligations.
    
    A spurned lover named “King of the Poorly Endowed Assholes” might resolve the Condition by rounding up a gang of fellow assholes and establishing authority over them with shows of strength and intimidation.
    
    If the Scion recovers the Legend imbued in this Boon, the Condition also resolves.`,
    isContinued: true,
  },
  {
    title: 'VERMILLION TAPE',
    purview: 'TIANMING',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: 'Long',
    duration: 'Indefinite',
    subject: 'One organization',
    mechanics: `You place a curse on a bureaucracy or similarly structured organization from within range of either its leader or its headquarters.
    
    Any member of the organization conducting its official business faces a +4 Complication. If the Complication is not bought off, the task either takes significantly longer than intended — enough that it occurs narratively “too late” — or it turns out to be misunderstood, resulting in an end product or accomplishment that is not what the character originally intended. 
    
    When you use this Boon, you can specify a behavior, such as holding weekly prayer rituals or wearing fancy suits, that lets a character ignore this Complication.`,
  },
  {
    title: 'FLESH OF THE WORLD',
	purview: 'NEXTLAHUALLI',
	cost: 'Free',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: 'Self',
	mechanics: `Sacrifice sustains your vital essence as well as your Legend.
	
	Once per session, when you receive Legend from a major sacrifice, you may resolve a single Condition affecting you.
	
	Additionally, you can survive off sacrifice alone, ignoring any harm or Complications from starvation, dehydration, or suffocation in a session where you have received at least 1 Legend from sacrifice.`,
  },
  {
    title: 'REPAY THE DEBT',
	purview: 'NEXTLAHUALLI',
	cost: 'Free',
	action: 'Reflexive',
	range: '',
	duration: 'Instant',
	subject: '',
	mechanics: `Whenever a mortal makes a sacrifice to one of the Teōtl or directly to you within (Legend x 25) miles or at one of your Sanctums, you become aware of their identity and their reason for the offering.
	
	You can answer the request by using a Boon or marvel, extending its range to the location of the sacrifice.
	
	Once per session, you may reduce the cost of a Boon or marvel used in response to a sacrifice by one point of imbued or spent Legend.`,
  },
  {
    title: 'LAY GEIS',
	purview: 'GEASA',
	cost: 'Spend 1 Legend',
	action: 'Simple',
	range: 'Short',
	duration: 'Condition',
	subject: 'One character',
	mechanics: `You place a geis on another character, speaking to them to explain the prohibition or obligation they must now obey.
	
	The only limitation on the geis is that the target must be capable of upholding it at the time you place it — if someone’s currently wearing a red shirt, you can’t geis them not to wear red.
	
	You regain the Legend spent on this Boon once the geis is broken.`,
  },
  {
    title: 'TONGUE OF THE BARD',
    purview: 'GEASA',
    cost: 'Imbue 1 Legend',
    action: 'Simple',
    range: '',
    duration: 'Indefinite',
    subject: 'One character',
    mechanics: `Your bard’s tongue speaks of a character’s prowess and deeds. Ask the Storyguide one of the following questions about a character you can see:
    <ul>
    <li>What is this character’s lineage (mortal and divine)?
    <li>What is a geis they are under?
    <li>What is a Deed they are best known for, are currently working on, or want to hide?
    <li>What is a Quality or Knack that they possess?
    </ul>

    In order to receive the answer, you must speak it aloud.  The Storyguide gives you an answer in the form of a speech or poem that you can perform. This information grants Enhancement 3 to any actions that benefit from it. Discovering that a good-looking stranger in a bar is descended from the Theoi would give an Enhancement on a roll to work out which of the Gods he is descended from, but not on a roll to impress him with a pick-up line.
    
    Against trivial targets, you may use this Boon for free.`,
    length: 'long',
  },
  {
    title: '',
    purview: '',
    cost: '',
    action: '',
    range: '',
    duration: '',
    subject: '',
    mechanics: ``,
    clash: '',
  },
];

const pantheonPurviews = new Set();
[
  'METAMORPHOSIS',
  'WYRD',
  'YOGA',
  'YAOYOROZU-NO-KAMIGAMI',
  'CHEVAL/GUN',
  'DODAEM',
  'HEKU',
  'TIANMING',
  'NEXTLAHUALLI',
  'GEASA',
].forEach(p => pantheonPurviews.add(p));

BOONS.sort((a, b) => {
	if (!a.title && b.title) return 1;
	if (a.title && !b.title) return -1;
	const asig = pantheonPurviews.has(a.purview);
	const bsig = pantheonPurviews.has(b.purview);
	if (asig && !bsig) return 1;
	if (!asig && bsig) return -1;
	const c = a.purview.localeCompare(b.purview);
	if (c !== 0) return c;
	const k = a.title.localeCompare(b.title);
	if (k !== 0) return k;
	if (a.isContinued && !b.isContinued) return 1;
	if (!a.isContinued && b.isContinued) return -1;
	return k;
});

createPages(BOONS, 4, boon => {
  const e = document.createElement('div');
  e.setAttribute('class', `
    card boon
	${boon.purview.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/, '-')}
  `);
  const clash = boon.clash ? `
    <div class="field compact round-bottom">
	  <div class="label">CLASH</div>
	  ${boon.clash}
	</div>
  ` : '';
  const length = (() => {
    if (boon.length === 'very') return 'verylong';
	if (boon.length) return 'long';
	return '';
  })();
  const attributes = boon.isContinued ? '' : `
	<div class="row compact">
	  <div class="field small round-top">
		<div class="label">ACTION</div>
		${boon.action}
	  </div>
	  <div class="field small round-top">
		<div class="label">RANGE</div>
		${boon.range || '—'}
	  </div>
	  <div class="field small round-top">
		<div class="label">DURATION</div>
		${boon.duration || '—'}
	  </div>
	</div>
    ${boon.subject ? `<div class="field compact">
	  <div class="label">SUBJECT</div>
	  ${boon.subject || '—'}
    </div>` : ''}
  `;
  e.innerHTML = `
	<div class="title">
		${boon.title.toLocaleUpperCase()}
	</div>
    <div class="subtitle">
      ${boon.isContinued ? `<i>(continued)</i>` : boon.cost}
    </div>
	${attributes}
	<div class="field big ${boon.clash ? '' : 'round-bottom'} ${boon.isContinued ? 'round-top' : ''}">
		<div class="details ${length}">
			${boon.mechanics.trim()
				.replace(/\n{2,}/g, '<p>')
				.replace(/\n+/g, '<br>')}
			${boon.continues ? `<p><span class="tbc">continued on back ⟶</span>` : ''}
		</div>
	</div>
	${clash}
	<div class="row compact footer">
		<div class="kind big">BOON</div>
		<div class="category compact">${boon.purview.toLocaleUpperCase()}</div>
	</div>
	`;
  return e;
});
