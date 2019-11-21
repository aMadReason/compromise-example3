import nlp from "compromise";

// most restrictive first
const types = [
  "#ParserComplexImplicit", // mix red and blue paint (both are paint but one is implicit)
  "#ParserComplex", // mix red paint and blue paint (explicit)
  "#ParserSimple" // mix paint 'basic'
];

const plugin = {
  words: {
    open: "Verb"
  },
  patterns: {
    "(light|mix)$": "#Noun",
    "^(light|mix)": "#Verb",
    "(#Conjunction|above|adjacent|beside|under|over|above|on|over|in|inside)":
      "#Join",
    "(north|east|south|west|left|right|up|down)": "#Direction",
    "#Verb (#Determiner|#Preposition)? #Adjective+ (with|using|on|using|and) (#Determiner|#Preposition)? #Adjective #Noun$":
      "#ParserComplexImplicit",
    "#Verb (#Determiner|#Preposition)? #Adjective+? #Noun #Join? (#Determiner|#Preposition)? #Adjective+? #Noun":
      "#ParserComplex",
    "#Verb (#Determiner|#Preposition)? #Adjective+? #Noun": "#ParserSimple"
  }
};

nlp.plugin(plugin);

export default function commandParser(input) {
  const doc = nlp(input)
    .clone()
    .normalize();

  const type = types.find(i => doc.has(i) && i);

  // Get output
  const tags = doc.out("tags");
  const verbs = doc
    .match("#Verb")
    .not("(#Join")
    .out("array");
  const nouns = doc.match("#Noun").out("array");
  let described = doc
    .not("#Direction")
    .not("#Join")
    .match("#Adjective+ #Noun")
    .out("array"); // unable to filter valid
  const joins = doc.match("#Join").out("array");

  // additionals
  const infinitives = verbs.map(
    v =>
      nlp(v)
        .verbs()
        .conjugate()[0].Infinitive
  );
  const singulars = doc
    .nouns()
    .toSingular()
    .out("array");
  const adjectives = doc
    .not("#Direction")
    .match("#Adjective")
    .out("array");
  const directions = doc.match("#Direction").out("array");

  if (type === types[0] && nouns.length > 0) {
    adjectives.map(a => {
      const describedAd = a + " " + nouns[0];
      if (described.includes(describedAd)) return undefined; // prevent dupes
      return (described = [describedAd, ...described]);
    });
  }

  // Commands
  const command = [
    verbs[0],
    described[0] || nouns[0],
    joins[0] || null,
    described[1] || nouns[1] || ""
  ]
    .filter(i => i)
    .join(" ");

  const strictCommand = [
    infinitives[0],
    described[0] || singulars[0],
    joins[0] || null,
    described[1] || singulars[1] || ""
  ]
    .filter(i => i)
    .join(" ");

  return {
    tags,
    infinitives,
    singulars,
    strictCommand,
    adjectives,
    directions,
    type,
    verbs,
    nouns,
    described,
    joins,
    command
  };
}
