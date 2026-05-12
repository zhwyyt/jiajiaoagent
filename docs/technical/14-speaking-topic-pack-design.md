# Speaking Topic Pack Design

## Purpose

Define the first V1 speaking-topic-pack structure and the core tutoring method for the elementary-school English speaking tutor.

This version should favor a more Western-style oral communication approach:

- encourage expression before perfection;
- use conversation to build confidence;
- help the child explain ideas, preferences, feelings, and simple reasons;
- avoid turning the interaction into answer-recitation.

## Core Teaching Direction

The first version should not behave like a vocabulary drill machine.

It should behave more like an encouraging early-years speaking teacher:

1. invite the child to say something real;
2. accept imperfect first answers;
3. expand the answer into a fuller sentence;
4. ask one natural follow-up;
5. close with a small success and a clear next step.

## Method Principles

### 1. Expression First

Primary goal:

- get the child to speak;
- keep the child speaking;
- gradually improve clarity and sentence length.

This means:

- do not interrupt every mistake;
- do not force grammar explanation every turn;
- value willingness, fluency, and idea expression first.

### 2. One Speaking Move Per Turn

Each turn should ask for only one small speaking task, such as:

- name;
- choice;
- description;
- feeling;
- simple reason;
- simple comparison.

### 3. Guided Conversation, Not Open Chat

The tutor should sound natural, but the structure should stay controlled.

Each topic should move through a small conversation arc:

1. warm-up;
2. basic naming;
3. simple description;
4. personal preference or feeling;
5. one follow-up detail;
6. short recap.

### 4. Scaffold Before Correction

When a child gets stuck, prefer:

- sentence starters;
- keyword choices;
- either/or prompts;
- repetition with support.

Only after that should the tutor push for a fuller answer.

### 4.1 Chinese Rescue Is Allowed

For V1, the tutor should allow limited Chinese rescue when the child gets stuck on one word or idea.

This is especially useful when the child:

- knows what they want to say but cannot recall one English word;
- mixes Chinese and English in one sentence;
- becomes quiet because they are afraid of saying it wrong.

Preferred handling:

1. accept the meaning without scolding the child;
2. give the English word or sentence model;
3. invite the child to try the full English sentence;
4. continue the conversation.

The system should treat mixed Chinese-English input as a bridge, not as the final target form.

Desired tutor behavior:

- accept `中英混说` as an input pattern;
- respond with a cleaner English sentence;
- encourage retry in English;
- avoid long grammar explanation.

Example:

- child:
  `我喜欢和 my brother 踢足球`
- tutor:
  `Good job! In English, you can say: I like to play football with my brother. Can you say it?`

### 5. Build Everyday Communicative Habits

The tutor should repeatedly train a few useful habits:

- answer in full sentences;
- add one more detail;
- say what you like;
- say why;
- ask and answer simple personal questions.

## V1 Topic-Pack Design Goals

The first pack should:

- stay close to daily child life;
- be easy to act out in voice chat;
- support repeated practice without feeling exactly the same each time;
- fit L1 to L3 speaking learners.

## V1 Topic Pack

Recommend starting with 6 core topics.

### 1. My Family

- `topicId`: `my-family`
- communication goal:
  talk about family members and simple family activities
- target output:
  `I have ...`, `My ... is ...`, `We ... together.`
- speaking moves:
  naming, describing, saying what people do
- sample follow-ups:
  - `Who is in your family?`
  - `Do you have a brother or sister?`
  - `What does your mother like to do?`
  - `What do you do together?`

### 2. My School Day

- `topicId`: `my-school-day`
- communication goal:
  describe school people, class routine, and favorite school moments
- target output:
  `I go to school at ...`, `My teacher is ...`, `I like ... class.`
- speaking moves:
  sequence, preference, simple reason
- sample follow-ups:
  - `What time do you go to school?`
  - `What is your favorite class?`
  - `Why do you like it?`

### 3. My Friends

- `topicId`: `my-friends`
- communication goal:
  introduce a friend and say what they do together
- target output:
  `My friend is ...`, `He/She likes ...`, `We play ...`
- speaking moves:
  introducing, describing, shared activity
- sample follow-ups:
  - `Who is your good friend?`
  - `What is your friend like?`
  - `What do you do together?`

### 4. My Favorite Food

- `topicId`: `my-favorite-food`
- communication goal:
  talk about foods, likes, dislikes, and simple reasons
- target output:
  `I like ...`, `It is ...`, `I like it because ...`
- speaking moves:
  preference, describing taste, simple reason
- sample follow-ups:
  - `What food do you like?`
  - `Is it sweet or salty?`
  - `Why do you like it?`

### 5. Weather and Clothes

- `topicId`: `weather-and-clothes`
- communication goal:
  connect weather with daily choices
- target output:
  `It is ... today.`, `I wear ...`, `I like ... weather.`
- speaking moves:
  observing, choosing, simple explanation
- sample follow-ups:
  - `How is the weather today?`
  - `What do you wear on a rainy day?`
  - `Do you like sunny days? Why?`

### 6. Hobbies and Play

- `topicId`: `hobbies-and-play`
- communication goal:
  talk about interests, play habits, and enjoyment
- target output:
  `I like ...`, `I can ...`, `It is fun because ...`
- speaking moves:
  preference, ability, simple reason
- sample follow-ups:
  - `What do you like to do after school?`
  - `Can you draw / sing / dance / ride a bike?`
  - `Why is it fun?`

## Turn Design Pattern

Each topic should reuse a common 6-step turn pattern:

1. `warm-up`
   - easy opener
   - yes/no or naming answer is acceptable
2. `full-sentence push`
   - ask the child to say the same idea in a sentence
3. `detail follow-up`
   - ask for one more fact
4. `feeling or preference`
   - ask what they like, feel, or choose
5. `reason`
   - ask one simple `why` or `because` question
6. `wrap-up`
   - praise one success
   - suggest one next-step speaking target

## V1 Scaffolding Toolkit

Each topic should define reusable scaffolds.

### Sentence Starters

- `I have ...`
- `My ... is ...`
- `I like ...`
- `I go to ...`
- `We ... together.`
- `It is ... because ...`

### Either/Or Prompts

- `Do you like apples or bananas?`
- `Is your friend funny or kind?`
- `Is it sunny or rainy today?`

### Add-One-More Prompts

- `Can you say one more sentence?`
- `Tell me one more detail.`
- `What else?`
- `Why do you like it?`

## Correction Style

Correction should stay light.

Preferred pattern:

1. praise effort;
2. model the better sentence;
3. invite retry;
4. continue conversation.

Example:

- child:
  `He like football.`
- tutor:
  `Good job telling me about your friend. We usually say: He likes football. Can you say it again?`

For Chinese-mixed input, correction should be even lighter:

1. keep the child talking;
2. translate only the blocked part;
3. rebuild one usable English sentence;
4. return to conversation quickly.

## Topic Data Shape Suggestion

Each topic should eventually support a richer config than the current minimal `TopicContext`.

Suggested fields:

```json
{
  "id": "my-family",
  "title": "My Family",
  "category": "daily-life",
  "targetLevelMin": 1,
  "targetLevelMax": 3,
  "communicationGoal": "Talk about family members and what they do together.",
  "speakingMoves": ["naming", "describing", "activity"],
  "keyVocabulary": ["mother", "father", "sister", "brother"],
  "keyPatterns": ["I have ...", "My ... is ...", "We ... together."],
  "starterQuestions": ["Who is in your family?"],
  "followUpQuestions": ["What do you do together?"],
  "eitherOrPrompts": ["Do you have a brother or a sister?"],
  "wrapupTargets": ["Say two full sentences about your family."],
  "commonMistakes": ["single-word answers", "missing full sentence"],
  "completionSignals": ["child gives two related sentences"]
}
```

## Immediate Implementation Implication

The next code step does not need a full database-backed topic system yet.

V1 can start with:

1. a static in-memory topic pack;
2. 6 topic definitions;
3. topic-aware starter questions and follow-up prompts;
4. wrap-up targets driven by topic config.

## Next Recommended Build Step

After this document, the most useful implementation step is:

1. upgrade `topicRepository` from placeholder data to static topic-pack definitions;
2. let `sessionService` opening messages come from topic config;
3. let tutor follow-ups vary by topic instead of only `my-family`.
