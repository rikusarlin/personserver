const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')


// Middlewaret
app.use(bodyParser.json())
app.use(morgan(':method :url :status :response-time :postdata'))
app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  },
  {
    "name": "Helena",
    "number": "asd893r45",
    "id": 8
  },
  {
    "name": "Riku2",
    "number": "37928",
    "id": 9
  },
  {
    "name": "Leo",
    "number": "041324789879",
    "id": 10
  }
]

/*
* This token adds body contents of POST requests to morgan log
*/ 
morgan.token('postdata', function (req, res) {
	if(req.method === "POST"){
		return JSON.stringify(req.body)
	} else {
		return null
	}
	return req.headers['content-type']
})

function paragraph(text){
	return "<p>"+text+"</p>\n"
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!!!</h1>')
})

app.get('/info', (req, res) => {
  const numberOfPersons = persons.length
  const dateTimeStr = String(new Date())
  const resString = paragraph(`Phonebook has info for ${numberOfPersons} people`).concat(paragraph(`${dateTimeStr}`))
  res.send(resString)
})

app.get('/persons', (req, res) => {
  res.json(persons)
})

app.get('/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = findById(id)
  if(person){
	res.json(person)
  } else {
	res.status(404).end()
  }
})

app.delete('/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = findById(id)
  if(person){
	persons = persons.filter(person => person.id !== id)
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

const generateId = () => {
  // Assignment said generated random id with suitable range... here 1M
  return Math.floor(Math.random() * (1000000));
  //const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0
  //return maxId + 1
}

const findById = (id) => {
  /* debug version
  const person = persons.find(person => {
	console.log(person.id, typeof person.id, typeof id, person.id === id)
    return person.id === id
  })
  */
  return persons.find(person => person.id === id)
}

const findByName = (name) => {
  /*
  const person = persons.find(person => {
	  console.log(person, person.name, name, person.name===name) 
	  return person.name === name
  })
  */
  return persons.find(person => person.name === name)
}


app.post('/persons', (req, res) => {
  const body = req.body
  if (!body.name) {
    return res.status(400).json({ 
      error: 'name is obligatory' 
    })
  }
  if (!body.number) {
    return res.status(400).json({ 
      error: 'number is obligatory' 
    })
  }
  existingPerson = findByName(body.name)
  //console.log("name : ",body.name)
  //console.log("existing person :", existingPerson)
  //console.log("person exists: ",(existingPerson === true))
  if(existingPerson){
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  const person = {
	name: body.name,
	number: body.number,
	id: generateId()
  }	  
  persons = persons.concat(person)
  res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})