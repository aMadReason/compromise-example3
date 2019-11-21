import nlp from "compromise";

const types = {
  simple: "#ParserSimple", // mix paint 'basic'
  complex: "#ParserComplex", // mix red paint and blue paint (explicit)
  implicit: "#ParserComplexImplicit" // mix red and blue paint (both are paint but one is implicit)
};

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
    "#Verb (#Determiner|#Preposition)? #Adjective+? #Noun": "#ParserSimple",
    "#Verb (#Determiner|#Preposition)? #Adjective+? #Noun #Join (#Determiner|#Preposition)? #Adjective+? #Noun":
      "#ParserComplex",
    "#Verb (#Determiner|#Preposition)? #Adjective+ (with|using|on|using|and) (#Determiner|#Preposition)? #Adjective #Noun$":
      "#ParserComplexImplicit"
  }
};

nlp.plugin(plugin);

export default function commandParser(input) {
  const doc = nlp(input)
    .clone()
    .normalize();

  const typeKey = Object.keys(types).find(t => doc.has(types[t] && types[t]));
  const type = types[typeKey];

  console.log(type);

  // Get output
  const tags = doc.normalize().out("tags");
  const verbs = doc
    .normalize()
    .match("#Verb")
    .not("(#Join")
    .out("array");
  const nouns = doc
    .normalize()
    .match("#Noun")
    .out("array");
  let described = doc
    .normalize()
    .not("#Direction")
    .not("#Join")
    .match("#Adjective+ #Noun")
    .out("array"); // unable to filter valid
  const joins = doc
    .normalize()
    .match("#Join")
    .out("array");

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

  if (type === types.implicit && nouns.length > 0) {
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
