require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

// Middlewaret
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :response-time :postdata'))
app.use(cors())

/*
* This token adds body contents of POST requests to morgan log
*/
morgan.token('postdata', function (req) {
  if(req.method === 'POST'){
    return JSON.stringify(req.body)
  } else {
    return null
  }
})

function paragraph(text){
  return '<p>'+text+'</p>\n'
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!!!</h1>')
})

app.get('/info', (req, res) => {
  const dateTimeStr = String(new Date())
  Person
    .find({}).then(persons => {
      const resString = paragraph(`Phonebook has info for ${persons.length} people`).concat(paragraph(`${dateTimeStr}`))
      res.send(resString)
    })
    .catch(() => {
      const resString = paragraph('Failed to find info for phonebook').concat(paragraph(`${dateTimeStr}`))
      res.send(resString)
    })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person
    .findById(req.params.id).then( person => {
      if(person){
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findOneAndUpdate(req.params.id, person, { new: true, runValidators: false, context: 'query'  })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
