const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());

morgan.token("data", function (req, res) {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  } else {
    return null;
  }
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.data(req, res),
    ].join(" ");
  })
);

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/info", (request, response) => {
  const info_str = `<div>Phonebook has info for ${
    phonebook.length
  } people.</div>
  <div>${Date()}</div>`;

  response.send(info_str);
});

app.get("/api/persons", (request, response) => {
  response.json(phonebook);
});

app.post("/api/persons", (request, response) => {
  const getNewID = () => {
    let id = Math.random() * 10000000;

    // const ids = phonebook.map((p) => p.id);

    // while (ids.includes(id.toFixed(0))) {
    //   id = Math.random() * 10000000;
    // }

    return Number(id.toFixed(0));
  };
  const person = request.body;

  if (person.name && person.number) {
    let existingNames = phonebook.map((p) => p.name.toUpperCase());

    if (existingNames.includes(person.name.toUpperCase())) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }
    person.id = getNewID();

    phonebook = phonebook.concat(person);

    response.json(person);
  } else {
    return response.status(400).json({
      error: "Missing name or number",
    });
  }
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  const person = phonebook.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  phonebook = phonebook.filter((p) => p.id !== id);

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
