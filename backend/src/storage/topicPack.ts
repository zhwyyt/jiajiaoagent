import type { TopicContext } from "../types/session.js";

const TOPIC_PACK: Record<string, TopicContext> = {
  "my-family": {
    topicId: "my-family",
    title: "My Family",
    openingMessage:
      "Hello! I am your English speaking buddy. We can talk about anything you like. What do you want to chat about today?",
    communicationGoal: "Talk about family members and simple family activities.",
    speakingMoves: ["naming", "description", "detail"],
    keyVocabulary: ["mother", "father", "sister", "brother", "family"],
    keyPatterns: ["I have ...", "My ... is ...", "We ... together."],
    sentenceStarters: ["I have ...", "My ... is ...", "We ... together."],
    starterQuestions: ["Who is in your family?", "Do you have a brother or sister?"],
    followUpQuestions: [
      "What does your mother or father like to do?",
      "What do you do together?",
      "Who do you play with at home?"
    ],
    eitherOrPrompts: ["Do you have a brother or a sister?"],
    wrapupTargets: [
      "Say two full sentences about your family.",
      "Add one family activity next time."
    ],
    completionSignals: ["child gives two related sentences about family"]
  },
  "my-school-day": {
    topicId: "my-school-day",
    title: "My School Day",
    openingMessage:
      "Hello! I am happy to chat with you today. What would you like to talk about?",
    communicationGoal: "Describe school routine, class life, and favorite school moments.",
    speakingMoves: ["description", "choice", "reason"],
    keyVocabulary: ["school", "teacher", "class", "friend", "homework"],
    keyPatterns: ["I go to school at ...", "My teacher is ...", "I like ... class."],
    sentenceStarters: ["I go to school at ...", "My teacher is ...", "I like ... class because ..."],
    starterQuestions: ["What do you do first at school?", "What is your favorite class?"],
    followUpQuestions: [
      "What time do you go to school?",
      "Why do you like that class?",
      "What do you do in the classroom?"
    ],
    eitherOrPrompts: ["Do you like English class or art class more?"],
    wrapupTargets: [
      "Say two sentences about your school day.",
      "Tell one reason next time."
    ],
    completionSignals: ["child describes one school routine and one preference"]
  },
  "my-friends": {
    topicId: "my-friends",
    title: "My Friends",
    openingMessage:
      "Hello! We can start with anything you like. What do you want to say first?",
    communicationGoal: "Introduce a friend and say what you do together.",
    speakingMoves: ["naming", "description", "detail"],
    keyVocabulary: ["friend", "kind", "funny", "play", "share"],
    keyPatterns: ["My friend is ...", "He or she likes ...", "We play ... together."],
    sentenceStarters: ["My friend is ...", "He or she is ...", "We ... together."],
    starterQuestions: ["Who is your good friend?", "What is your friend like?"],
    followUpQuestions: [
      "What do you do together?",
      "Why do you like your friend?",
      "Is your friend funny or kind?"
    ],
    eitherOrPrompts: ["Is your friend funny or kind?"],
    wrapupTargets: [
      "Say two sentences about your friend.",
      "Add one activity you do together."
    ],
    completionSignals: ["child names a friend and adds one detail"]
  },
  "my-favorite-food": {
    topicId: "my-favorite-food",
    title: "My Favorite Food",
    openingMessage:
      "Hello! I am ready to chat with you. What do you want to talk about first?",
    communicationGoal: "Talk about favorite foods, taste, and simple reasons.",
    speakingMoves: ["choice", "description", "reason"],
    keyVocabulary: ["food", "sweet", "salty", "rice", "fruit"],
    keyPatterns: ["I like ...", "It is ...", "I like it because ..."],
    sentenceStarters: ["I like ...", "It is ...", "I like it because ..."],
    starterQuestions: ["What food do you like best?", "Is it sweet or salty?"],
    followUpQuestions: [
      "Why do you like it?",
      "When do you eat it?",
      "Who cooks it for you?"
    ],
    eitherOrPrompts: ["Do you like noodles or rice more?"],
    wrapupTargets: [
      "Say one food and one reason.",
      "Try two connected sentences next time."
    ],
    completionSignals: ["child states a preference and one reason"]
  },
  "weather-and-clothes": {
    topicId: "weather-and-clothes",
    title: "Weather and Clothes",
    openingMessage:
      "Hello! We can chat like friends first. What is on your mind today?",
    communicationGoal: "Connect weather with daily choices and clothes.",
    speakingMoves: ["description", "choice", "reason"],
    keyVocabulary: ["sunny", "rainy", "cloudy", "jacket", "T-shirt"],
    keyPatterns: ["It is ... today.", "I wear ...", "I like ... weather."],
    sentenceStarters: ["It is ... today.", "I wear ...", "I like ... because ..."],
    starterQuestions: ["How is the weather today?", "What do you wear on a rainy day?"],
    followUpQuestions: [
      "Do you like sunny days? Why?",
      "What do you wear when it is cold?",
      "What can you do on a sunny day?"
    ],
    eitherOrPrompts: ["Is it sunny or rainy today?"],
    wrapupTargets: [
      "Say one weather sentence and one clothes sentence.",
      "Add one reason next time."
    ],
    completionSignals: ["child connects weather and clothing choice"]
  },
  "hobbies-and-play": {
    topicId: "hobbies-and-play",
    title: "Hobbies and Play",
    openingMessage:
      "Hello! Let's chat in English. You can start with any topic you like.",
    communicationGoal: "Talk about interests, play habits, and enjoyment.",
    speakingMoves: ["choice", "detail", "reason"],
    keyVocabulary: ["draw", "sing", "dance", "bike", "game"],
    keyPatterns: ["I like ...", "I can ...", "It is fun because ..."],
    sentenceStarters: ["I like ...", "I can ...", "It is fun because ..."],
    starterQuestions: ["What do you like to do after school?", "Can you draw or sing?"],
    followUpQuestions: [
      "Why is it fun?",
      "Who do you do it with?",
      "What do you do on weekends?"
    ],
    eitherOrPrompts: ["Do you like drawing or singing more?"],
    wrapupTargets: [
      "Say one hobby and one reason.",
      "Add who you do it with next time."
    ],
    completionSignals: ["child describes one hobby with one detail"]
  }
};

export function getTopicContextById(topicId: string): TopicContext {
  return TOPIC_PACK[topicId] ?? buildFallbackTopicContext(topicId);
}

function buildFallbackTopicContext(topicId: string): TopicContext {
  const title = topicId.replace(/-/g, " ");

  return {
    topicId,
    title,
    openingMessage: "Hello! We can talk about anything you like. What do you want to say first?",
    communicationGoal: `Talk about ${title} with one or two simple sentences.`,
    speakingMoves: ["description", "detail"],
    keyVocabulary: [],
    keyPatterns: ["I like ...", "It is ...", "I can ..."],
    sentenceStarters: ["I like ...", "It is ...", "I can ..."],
    starterQuestions: [`What can you tell me about ${title}?`],
    followUpQuestions: ["Can you say one more sentence?", "What else can you tell me?"],
    eitherOrPrompts: [],
    wrapupTargets: ["Say two connected sentences next time."],
    completionSignals: ["child gives at least one full sentence"]
  };
}
