const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../utils/config')

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      const decodedToken = jwt.verify(token, config.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }

      const user = await User.findById(decodedToken.id)
      if (!user) {
        return response.status(401).json({ error: 'user not found' })
      }

      request.user = user
    } catch (error) {
      return response.status(401).json({ error: 'token invalid' })
    }
  } else {
    request.user = null
  }

  next()
}

module.exports = userExtractor
