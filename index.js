require('dotenv').config()
require('./mongo')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler')
const Person = require('./models/Person')

morgan.token('post-data', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['post-data'](req, res)
  ].join(' ')
}))
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  const time = new Date().toString()
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>\n<p>${time}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).json({
        error: "Not found"
      })
    }
  }).catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const person = request.body
  const newPersonInfo = {
    name: person.name,
    number: person.number
  }
  Person.findByIdAndUpdate(id, newPersonInfo, { new: true, runValidators: true }).then(result => {
    response.json(result)
  }).catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  if (!person || !person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }
  Person.find({}).then(persons => {
    if (persons.some(el => el.name === person.name)) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
  })
  const newPerson = new Person({
    name: person.name,
    number: person.number
  })
  newPerson.save().then(savedPerson => {
    response.status(201).json(savedPerson)
  }).catch(err => next(err))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
