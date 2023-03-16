const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
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


app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const id = Math.floor(Math.random()*1000000)
  const person = request.body
  if (!person.name || !person.number){
    return response.status(400).json({
      error: 'content missing'
    })
  }
  if (persons.find(p => p.name === person.name)){
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  person.id = id
  persons = persons.concat(person)
  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person){
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.get('/info', (request, response) => {
  console.log(request)
  const time = new Date()
  const res = `Phonebook has info for ${persons.length} people <br> ${time}`
  response.send(res)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})