function raadsr() {
  const isNone = x => typeof x === 'undefined' || x === null;
  const isBlank = x => isNone(x) || `${x}`.trim().length === 0;

  const qcont = document.getElementById('test-questions');

  const questions = [];

  const Q = (qlabel, ctx, rev) => {
    const question = {
      question: qlabel,
      scoring: isNone(rev)
        ? (x => 4 - x - 1)
        : (x => x),
      ctx,
    };

    const el = document.createElement('div');
    question.element = el;
    questions.push(question);
    question.ord = questions.length;

    const options = [
      'True now and when I was young',
      'True only now',
      'True only when I was younger than 16 <span class="ctx">and/or developed coping skills and workarounds</span>',
      'Never true<span class="ctx"> (meaning not true for any age, <i>not</i> that you literally never do it)</span>',
    ];

    const qid = `q${question.ord}`;

    el.setAttribute('class', 'question');
    el.innerHTML = `
      <fieldset>
        <legend>${question.ord}. ${question.question}</legend>
        ${isBlank(question.ctx) ? '' : `
          ${question.ctx.split("\n").filter(x => !isBlank(x)).map(x => `
          <div class="ctx block">${x}</div>
          `).join("")}
        `}
        ${options.map((o, index, arr) => {
          const id = `${qid}-${index}`;
          const score = question.scoring(index);
          return `
          <div>
            <input
              type="radio"
              id="${id}"
              name="${qid}"
              value="${score}"
            />
            <label for="${id}">
              ${String.fromCharCode('a'.charCodeAt(0) + index)}.
              ${o}
            </label>
          </div>
          `;
        }).join("")}
      </fieldset>
    `;
    qcont.appendChild(el);
  };

  const form = document.querySelector('form.test');
  const getscore = document.querySelector('#get-score');
  const scorebox = document.querySelector('#score');
  const reset = document.querySelector('button[type="reset"]');
  
  form.addEventListener("submit", e => {
    const data = new FormData(form);
    const missingQuestions = [];
    let lastOrd = 0;
    let total = 0;
    for (const entry of data) {
      let ord = parseInt(entry[0].substring(1));
      for (let i = lastOrd + 1; i < ord; i++) {
        missingQuestions.push(i);
      }
      total += parseInt(entry[1]);
      lastOrd = ord;
    }
    if (lastOrd === 0) {
      e.preventDefault();
      return;
    }
    if (missingQuestions.length > 0) {
      scorebox.innerHTML = `
        <div class="error">
          Missing question${missingQuestions.length === 1 ? '' : 's'}: ${missingQuestions.map(m => `${m}`).join(', ')}
        </div>
      `;
    } else {
      const paper = `Ritvo et al`;
      scorebox.innerHTML = `<div class="score">
        <div class="numb">${total}</div>
        <div class="interpretation">
        ${
          total > 133
          ? `<b>You are almost certainly autistic.</b> You scored higher than the average autistic person in ${paper}.`
          : total >= 65

          ? `<b>You are likely autistic.</b> No neurotypicals scored higher than 65 in ${paper}.`
          : total >= 52
          ? `<b>You likely are not autistic.</b> Only 3% of autistic subjects in ${paper} scored between 52 and 65.`
          : `<b>You are very unlikely to be autistic.</b> No autistic subjects in ${paper} scored below 52.`
        }
        </div>
      </div>`;
    }
    e.preventDefault();
  });

  reset.addEventListener('click', () => {
    scorebox.innerHTML = '';
  });

  Q("I am a sympathetic person.", `
    This really is asking "do allistic (non-autistic) people view me as sympathetic," not just whether you're capable of feeling other people's emotions. That is to say, this question is asking "do you consistently know how to <i>express</i> sympathy to other people in a way that they find helpful."
    
    For example, many autistic people express sympathy by offering an anecdote from their own life where they experienced something similar. Other austic people find this helpful, but allistic people often interpret this as trying to take the spotlight instead of being sympathetic.
  `, 1);
  Q("I often use words and phrases from movies and television in conversations.", `
    Or any other kind of media, including social media and books and comics, or even a phrase you just heard someone use once, or a word you learned last month that you've decided is delightful and are saying a lot in conversation.
  `);
  Q("I am often surprised when others tell me I have been rude.", `
    Because you had no ill-intent and just thought you were contributing to a conversation, or because you just didn't notice something or realize you were supposed to do a certain thing, or because you were just trying to ask for clarification and they interpreted it as challenging their authority, etc etc.
  `);
  Q("Sometimes I talk too loudly or too softly, and I am not aware of it.");
  Q("I often don't know how to act in social situations.", `
    Specifically <i>new</i> social situations, or in things like small-talk with people you aren't close to / don't know well.
  `);
  Q("I can 'put myself in other people's shoes.'", `
    Neurotypical people's shoes. Like, you can intuitively understand why someone got mad at you without having to intellectually work it out like a puzzle.
  `, 1);
  Q("I have a hard time figuring out what some phrases mean, like 'you are the apple of my eye.'", `
    New phrases! Not things you've already learned.
  `);
  Q("I only like to talk to people who share my special interests.", `
    Like does small talk suck, are you bored when people are talking about things, or do you have to play mind-games with yourself to get yourself to be interested in whatever they're talking about.
  `);
  Q("I focus on details rather than the overall idea.", `
    For example, without the added context here, would you get hung up on whether "True only when I was younger than 16" was exactly the age of 16 versus maybe when you were 12 or when you were 20.

    Or whether using phrases from movies and television was referring to only movies and television, or all media in general, or whether streaming anime counted as "television."
  `);
  Q("I always notice how food feels in my mouth. This is more important to me than how it tastes.", `
    Again, not literally always, and not literally always more important. Obviously if something tastes bad but has a good texture you're still not going to like it. And usually even autistic people don't notice textures when they're not bothersome, just like you don't notice when a rock <i>isn't</i> in your shoe.

    This is really asking, if something tastes good but has a weird texture, would you be like ick I don't like that. Like the texture of beef tongue, or how spinach makes your teeth feel, etc.
  `);
  Q("I miss my best friends or family when we are apart for a long time.", `
    This is "I consistently miss people when we're apart."

    If you can go months without talking to a close friend without often thinking about them, and then reconnect like no time as passed, then this question isn't true for you. 
  `, 1);
  Q("Sometimes I offend others by saying what I am thinking, even if I don't mean to.", `
    Often happens when autistic people just share a fact or information related to the situation, and allistic people read too much into it. Or if you correct someone if they repeat a common misconception etc.

    If you've learned that that kind of thing is an issue and you restrain yourself, that's the "True only when I was younger than 16" option.
  `);
  Q("I only like to think and talk about a few things that interest me.", `
    Not literally only. This is asking, do you prefer to spend most of your time thinking about your special interests.
  `);
  Q("I'd rather go out to eat in a restaurant by myself than with someone I know.", `
    An <i>allistic</i> person you know. Like a random coworker or something.
  `);
  Q("I cannot imagine what it would be like to be someone else.", `
    You have trouble imagining what it would be like to be someone who <i>thinks differently than you</i>, not just someone who had different life experiences.
  `);
  Q("I have been told that I am clumsy or uncoordinated.");
  Q("Others consider me odd or different.");
  Q("I understand when friends need to be comforted.", `
    Consistently. Includes whether you can tell when somebody wants advice or just comfort.
  `, 1);
  Q("I am very sensitive to the way my clothes feel when I touch them. How they feel is more important to me than how they look.", `
    Not all-or-nothing. If you have that one scratchy top that looks really nice so you bite the bullet and wear it when you want to dress up for something, this question is still True for you.

    If you like to cut out tags, this question is probably True for you.
  `);
  Q("I like to copy the way certain people speak and act. It helps me appear more normal.", `
    Not fully copy one to one, but do you figure out how to act in social situations by carefully watching and analyzing what other people are doing.
  `);
  Q("It can be very intimidating for me to talk to more than one person at the same time.", `
    Not necessarily intimidating as in "scary," but does it drain your social battery faster, does it feel overwhelming or disorienting.
  `);
  Q("I have to 'act normal' to please other people and make them like me.", `
    I.e., is being yourself a bad idea in many situations with allistic people.
  `);
  Q("Meeting new people is usually easy for me.", `
    If you've learned to do a good job of introducing yourself and being friendly, but it still stresses you out, the answer is False.
  `, 1);
  Q("I get highly confused when someone interrupts me when I am talking about something I am very interested in.", `
    As in, you get caught off guard by them saying something that doesn't seem relevant to what you were saying, because you didn't immediately pick up that they were bored and trying to change the subject.
  `);
  Q("It is difficult for me to understand how other people are feeling when we are talking.", `
    Did you have to explicitly learn to study their expression and body language to tell when they were bored or upset?
  `);
  Q("I like having a conversation with several people, for instance around a dinner table, at school or at work.", `
    Random neurotypical people. Not your family and friends.
  `, 1);
  Q("I take things too literally, so I often miss what people are trying to say.", `
    If you're like "I don't take things too literally, I understand obvious sarcasm and know what a metaphor is," congrats, you took this question too literally.

    If you frequently (not always!) miss that somebody was joking etc, then you do this.
  `);
  Q("It is very difficult for me to understand when someone is embarrassed or jealous.", `
    If you're like "no it's easy because I've learned what body language means what and maybe have a mental flow chart about it," no. Allistic people don't have to do that, they just automatically know because of how their brains are wired.

    If you had to <i>learn</i> how to understand this, it's very difficult for you relative to an allistic person.
  `);
  Q("Some ordinary textures that do not bother others feel very offensive when they touch my skin.");
  Q("I get extremely upset when the way I like to do things is suddenly changed.", `
    This refers to changes you did not make yourself and were not expecting.

    "Extremely upset" includes if you dissociate / shut down, those are ways of coping with strong emotions even if you don't directly feel them.
  `)
  Q("I have never wanted or needed to have what other people call an 'intimate relationship.'");
  Q("It is difficult for me to start and stop a conversation. I need to keep going until I am finished.", `
    Like does it take effort to stop talking about your special interest or a subject you care strongly about.
  `);
  Q("I speak with a normal rhythm.", `
    If you have a set of speech patterns / cadences that you learned to use to <i>seem</i> normal, and you reuse those over and over, the answer to this question is False.
  `, 1);
  Q("The same sound, color or texture can suddenly change from very sensitive to very dull.");
  Q("The phrase 'I've got you under my skin' makes me uncomfortable.", `
    Like do you think about what that would literally feel like and get squicked.
  `);
  Q("Sometimes the sound of a word or a high-pitched noise can be painful to my ears.");
  Q("I am an understanding type of person.", `
    To allistic people. Not just do you have patience with them, do you intuitively get what they're thinking.
  `, 1);
  Q("I do not connect with characters in movies and cannot feel what they feel.", `
    Or any other type of media.
  `);
  Q("I cannot tell when someone is flirting with me.", `
    If you get home and then realize it and kick yourself, this is you.
  `);
  Q("I can see in my mind in exact detail things that I am interested in.", `
    This is about your mental visualization acuity.
  `);
  Q("I keep lists of things that interest me, even when they have no practical use (for example sports statistics, train schedules, calendar dates, historical facts and dates).", `
    Cool words, quotes, books, etc.
  `);
  Q("When I feel overwhelmed by my senses, I have to isolate myself to shut them down.", `
    Avoiding loud places like concerts, malls, and clubs etc so that this never happens is cheating. Also if you can power through for a bit, this is still True for you because you <i>have to power through</i>.

    If there are some noisy environments that you can tolerate because you really like them (like maybe you really love arcades or conventions), otherwise you do have a problem with it, this is still True for you.
  `);
  Q("I like to talk things over with my friends.", '', 1);
  Q("I cannot tell if someone is interested or bored with what I am saying.", `
    Allistic people can tell intuitively without having to learn what different expressions and body language mean.
  `);
  Q("It can be very hard to read someone's face, hand and body movements when they are talking.", `
    Again, "very hard" means you don't intuitively know what all their expressions and body language means, you had to explicitly learn.
  `);
  Q("The same thing (like clothes or temperatures) can feel very different to me at different times.");
  Q("I feel very comfortable with dating or being in social situations with others.", `
    Especially <i>new</i> social situations with people you don't know well.
  `, 1);
  Q("I try to be as helpful as I can when other people tell me their personal problems.", '', 1);
  Q("I have been told that I have an unusual voice (for example flat, monotone, childish, or high-pitched).", `
    Or you have a habit of saying things in a specific cadence, that would be normal for other people except that you don't vary it enough.
  `);
  Q("Sometimes a thought or a subject gets stuck in my mind and I have to talk about it even if no one is interested.", `
    Like you maybe can still restrain yourself, but it takes effort.
  `);
  Q("I do certain things with my hands over and over again (like flapping, twirling sticks or strings, waving things by my eyes).", `
    Or clenching your jaw, or tensing and untensing your arms or legs in a way that's subtle, or chewing your cheek, or adjusting your clothing over and over, or playing with your hair, clicking pens.

    Still counts if you really want to but you suppress it to not cause problems.
  `);
  Q("I have never been interested in what most of the people I know consider interesting.", `
    Sports or gossip or whatever.
  `);
  Q("I am considered a compassionate type of person.", `
    Again, considered <i>by allistic people</i>.
  `, 1);
  Q("I get along with other people by following a set of specific rules that help me look normal.", `
    Rules, tricks, mneumonics, etc.

    Doesn't apply when you're with other autistic people / people you are very comfortable with.
  `);
  Q("It is very difficult for me to work and function in groups.", `
    Groups of allistic people.
  `);
  Q("When I am talking to someone, it is hard to change the subject. If the other person does so, I can get very upset and confused.", `
    Like you can probably still do it but it takes effort.
  `);
  Q("Sometimes I have to cover my ears to block out painful noises (like vacuum cleaners or people talking too much or too loudly).", `
    Includes wearing earplugs or headphones.

    Also includes cheating by just leaving the room or not going to movie theaters or not watching firework displays.

    Also includes dissociating really hard.
  `);
  Q("I can chat and make small talk with people.", `
    Talking about your or their special interest does not count.
  `, 1);
  Q("Sometimes things that should feel painful are not (for instance when I hurt myself or burn my hand on the stove).");
  Q("When talking to someone, I have a hard time telling when it is my turn to talk or to listen.", `
    As compared to a neurotypical person who can intuitively tell without having to think about it.
  `);
  Q("I am considered a loner by those who know me best.", `
    Or just very introverted.
  `);
  Q("I usually speak in a normal tone.", `
    As appropriate for the situation, more often than not.
  `, 1);
  Q("I like things to be exactly the same day after day and even small changes in my routines upset me.", `
    Isn't saying that everyday is exactly the same, obviously people have different schedules on different days of the week and there are always special occasions and whatnot.

    This is asking if you get upset if you unexpectedly run out of your usual breakfast item or coffee, or if you usually shower in the morning but the water is out so you have to do it in the evening, or you usually brush your teeth before you shower but for some reason you have to do it after today, or you go to your favorite restaurant and they're out of the thing you usually order.

    These are changes to your routine that you didn't intend or expect.
  `);
  Q("How to make friends and socialize is a mystery to me.");
  Q("It calms me to spin around or to rock in a chair when I'm feeling stressed.", `
    You may or may not actually be in the habit of doing this, but if you did do this, would it help?
  `);
  Q("The phrase, 'He wears his heart on his sleeve,' does not make sense to me.", `
    Not that you don't literally know what it means, you've probably learned it by now. But does the phrase make sense to you? Or did you just have to learn it and bewere like that's weird but ok.

    Also applies to other phrases, like "have your cake and eat it too."
  `);
  Q("If I am in a place where there are many smells, textures to feel, noises or bright lights, I feel anxious or frightened.", `
    Or just stressed or tired or overwhelmed or disoriented or heavily dissociated.
  `);
  Q("I can tell when someone says one thing but means something else.", `
    Like, consistently. You probably can detect obvious sarcasm, but are there times it isn't obvious to you?
  `, 1);
  Q("I like to be by myself as much as I can.", `
    Or maybe around one or two people who you are very close to.
  `);
  Q("I keep my thoughts stacked in my memory like they are on filing cards, and I pick out the ones I need by looking through the stack and finding the right one (or another unique way).",`
    Not necessarily all the time.

    When you recall a memory do you sometimes visualize a movie reel or picking it out of a box? When you remember something uncomfortable do you visualize physically pushing it away? When you're in the middle of a conversation, do you visualize a dialog tree to go back to an earlier point? Or something similar to any of that?

    Basically, allistic people don't do as much metacognition. They just sort of do things without being aware of their thought process. 
  `);
  Q("The same sound sometimes seems very loud or very soft, even though I know it has not changed.");
  Q("I enjoy spending time eating and talking with my family and friends.", `
    Allistic ones. Parallel play doesn't count.
  `, 1);
  Q("I can't tolerate things I dislike (like smells, textures, sounds or colors).", `
    Or really bothers you in a way that's very distracting, or causes you to dissociate heavily.
  `);
  Q("I don't like to be hugged or held.", `
    Or are you like a cat and you like it sometimes, by other times it really bothers you.
  `);
  Q("When I go somewhere, I have to follow a familiar route or I can get very confused and upset.", `
    Scouting out the route on google maps beforehand counts.
  `);
  Q("It is difficult to figure out what other people expect of me.", `
    Not in every situation. But often when people ask you to do things, it's not clear how they want it done, and you may have difficulty asking for clarification in a way that gets you useful answers.
  `);
  Q("I like to have close friends.", '', 1);
  Q("People tell me that I give too much detail.");
  Q("I am often told that I ask embarrassing questions.");
  Q("I tend to point out other people's mistakes.", `
    This includes correcting common misconceptions when people say them in conversation, and when you're just trying to be helpful when somebody does something wrong.
  `);

  console.log('test initialized.');
}

function randomizeRaadsr() {
  const arr = Array.from(document.querySelectorAll('input'));
  while (arr.length > 0) {
    const i = Math.floor(Math.random() * arr.length);
    const e = arr[i];
    arr.splice(i, 1);
    e.click();
  }
}

