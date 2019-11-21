import commandParser from "./commandParser";

const test1 = () => {
  const root = document.createElement("form");
  root.innerHTML = `
    <hr/>
      <div>
        <label for="test1_input1">Input 1:</label>
        <input name="test1_input1" type="text" value="mix the red and blue mix">
      </div>
      <button type="submit">Go!</button>
      <div class="response"></div>
      <hr />
  `;

  root.addEventListener("submit", e => {
    e.preventDefault();
    const target = e.target;
    const response = root.querySelector(".response");
    const [input] = target;

    const res = commandParser(input.value, { complex: true });

    const {
      type,
      verbs,
      nouns,
      described,
      joins,
      command,
      strictCommand,
      tags
    } = res;
    console.log(res);
    //Exit if invalid input
    if (!type) {
      response.innerHTML = `I don't understand '${input.value}'<br />`;
      return;
    }

    // Response if valid input
    response.innerHTML = `
      <p>
      ${type}<br>
      ${command}
      </p>
      Verbs
      <pre>${JSON.stringify(verbs, null, 2)}</pre>
      Nouns
      <pre>${JSON.stringify(nouns, null, 2)}</pre>
      Described Nouns
      <pre>${JSON.stringify(described, null, 2)}</pre>
      Joins
      <pre>${JSON.stringify(joins, null, 2)}</pre>
      strict command
      <dialog open><pre>${JSON.stringify(strictCommand, null, 2)}</pre></dialog>
    `;
  });

  return root;
};

// Write Javascript code!
const appDiv = document.getElementById("app");
appDiv.innerHTML = `<h1>JS Starter</h1>`;

appDiv.appendChild(test1());
