const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blog = require('../models/blog')
const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10
  }
]
let token = null

beforeAll(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'testuser', name: 'Test User', passwordHash })
  await user.save()

  // login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'sekret' })

  token = loginResponse.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blog')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blog')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('blog post unique identifier is named id', async () => {
  const response = await api.get('/api/blog')

  expect(response.body[0].id).toBeDefined()
  expect(response.body[0]._id).toBeUndefined()
})

test('a valid blog can be added' , async () =>{
    const newBlog ={
        title: "AI scary",
        author: "ali",
        url: "http://example.com/ai-scary",
        likes: 15
    }
    const blogsAtStart = await api.get('/api/blog')
    await api
        .post('/api/blog')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await api.get('/api/blog')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length + 1)
    const titles = blogsAtEnd.body.map(blog => blog.title)      
    expect(titles).toContain(newBlog.title)
    })

test('if the likes are missing then default to 0', async () => {
  const newBlog = {
    title: "no one likes this",
    author: "kafka",
    url: "http://example.com/no-one-likes-this"
    // likes is intentionally omitted
  }

  const response = await api
    .post('/api/blog')
    .send(newBlog)  // Send the object, not a string
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)  // Separate expect
})

test('if the url is missing then return 400', async () => {
  const newBlog = {
    title: "Missing URL",
    author: "Test Author",
    likes: 5
  }

  const response = await api
    .post('/api/blog')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(response.body.error).toContain('url') // Assuming your error middleware returns this
})

test('a blog is deleted successfully', async () => {
  const blogsAtStart = await api.get('/api/blog')
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blog/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blog')
  expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)

  const titles = blogsAtEnd.body.map(blog => blog.title)
  expect(titles).not.toContain(blogToDelete.title)
})
test('a blog can be updated sucessfully', async() => {
  const blogsAtStart = await api.get('/api/blog')
  const blogtoupdate = blogsAtStart.body[0]
  const updatedblog ={...blogtoupdate, likes:blogtoupdate.likes + 1}
  const response = await api
    .put(`/api/blog/${blogtoupdate.id}`)
    .send(updatedblog)
    .expect(200)
    .expect('Content-Type',/application\/json/)
  expect(response.body.likes).toBe(blogtoupdate.likes + 1)
})

test('a valid blog can be added with a valid token', async () => {
  // Login to get the token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpass' })

  const token = loginResponse.body.token

  const newBlog = {
    title: 'New Blog Post',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVuaXF1ZXVzZXIiLCJpZCI6IjY4NDU4YWU0MGQ0ZTA5ZjE5YTY3YzMzMyIsImlhdCI6MTc0OTQwODY1Mn0.WOG2YwWsodzHbojTAyoVkBwHn9GQWm2gp4VH7Ode-cI`) // ✅ set token
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})
test('adding a blog fails with 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized blog',
    author: 'Someone',
    url: 'http://unauth.com',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogs = await Blog.find({})
  expect(blogs).toHaveLength(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})
