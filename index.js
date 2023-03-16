require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(function (tokens,req,res) {
  const result =  [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]
  if (req.method === "POST"){
    result.push(JSON.stringify(req.body))
  }
  return result.join(' ')
}))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response,next) => {
  Person.find({}).then(result => {
    response.json(result)
  }).catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const {name,number} = request.body

  Person.findByIdAndUpdate(request.params.id, {name,number}, {new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
    response.json(updatedPerson)
  }).catch((error) => next(error))

})


app.get('/info', (request, response) => {
  Person.count({}).then(result => {
  const time = new Date()
  const res = `Phonebook has info for ${result} people <br> ${time}`
  response.send(res)
  }).catch((error) => next(error))
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)