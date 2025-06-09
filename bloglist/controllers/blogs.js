const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const tokenExtractor = require('../middleware/tokenExtractor')

blogRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    res.json(blogs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'internal server error' })
  }
})


blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = request.token

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})


  blogRouter.put('/:id',async(request,response,next) => {
    
    
    try{
      const { title, author, url, likes } = request.body

      const result = await Blog.findByIdAndUpdate(request.params.id,{ title, author, url, likes },{new: true, context: 'query'})
    if(result){
      response.json(result)
    } else{
      response.status(404).json({ error:'Blog not found' })
    }
    }catch(error){
      next(error)
    }
  })
blogRouter.delete('/:id', tokenExtractor, async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    // Check if the blog's user matches the token's user
    if (blog.user.toString() !== request.user.id) {
      return response.status(403).json({ error: 'Access denied: not blog owner' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter