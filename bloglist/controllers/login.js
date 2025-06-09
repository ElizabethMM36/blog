const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  console.log('LOGIN ATTEMPT FOR:', username)

  try {
    const user = await User.findOne({ username })

    if (!user) {
      console.log('User not found')
      return response.status(401).json({ error: 'invalid username or password' })
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!passwordCorrect) {
      console.log('Incorrect password')
      return response.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    console.log('SECRET used to sign token:', config.SECRET)

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: '1h' })

    console.log('Generated token:', token)

    response.status(200).send({
      token,
      username: user.username,
      name: user.name,
    })
  } catch (error) {
    console.error('Login error:', error.message)
    response.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = loginRouter
