const { Schema, model } = require('mongoose')

const personSchema = new Schema({
  name: String,
  number: String
})

const Person = model('Person', personSchema)

module.exports = Person
