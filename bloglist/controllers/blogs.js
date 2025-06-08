const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


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
  const user = await User.findOne({})

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id // Assuming you want to associate the first user with the blog
  })

  try {
    const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)  // Important: passes ValidationError to middleware
  }
})

blogRouter.delete('/:id', async(request,response,next) => {
  try{
    const deleted = await Blog.findByIdAndDelete(request.params.id)
    if(deleted){
      response.status(204).end()
    }else{
      response.status(404).json({ error: 'Blog not found' })
    }
  }catch(error){
    next(error)}
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


module.exports = blogRouter