const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
if (typeof username !== 'string' || typeof password !== 'string') {
  return response.status(400).json({ error: 'username and password required' })
}

if (username.length < 3) {
  return response.status(400).json({ error: 'username must be at least 3 characters' })
}

if (password.length < 3) {
  return response.status(400).json({ error: 'password must be at least 3 characters' })
}

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

 try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return response.status(400).json({ error: 'username must be unique' })
    }
    throw error
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

module.exports = usersRouter