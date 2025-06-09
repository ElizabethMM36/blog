
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogRouter = require('./controllers/blogs')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const tokenExtractor = require('./middleware/tokenExtractor')
const userExtractor = require('./middleware/userExtractor')
const app = express()

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })
  



app.use(express.json())


app.use(tokenExtractor)
app.use('/api/blog', blogRouter)
app.use('/api/users', usersRouter)

app.use('/api/login', loginRouter)

app.use((error, request, response, next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})


module.exports = app
