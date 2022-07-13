const { Schema, model } = require('mongoose')

const personSchema = new Schema({
  name: {
    type: String,
    minLength: 3
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        return (/\d{2}-\d/.test(v) || /\d{3}-\d/.test(v)) && v.split('-').length <= 2
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

const Person = model('Person', personSchema)

module.exports = Person
