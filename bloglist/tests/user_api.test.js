const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const api = supertest(app)


describe('creating a user',() => {
    beforeEach(async () => {
        await User.deleteMany({})
    })



test('fails if the password is too short', async () => {
  const newUser = {
    username: 'validusername',
    name: 'Valid Name',
    password: 'pw'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  expect(result.body.error).toContain('password must be at least 3 characters')
})
test('fails if the username is too short', async () => {
  const newUser = {
    username: 'un',
    name: 'Valid Name',
    password: 'validpassword'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  expect(result.body.error).toContain('username must be at least 3 characters')
})

test('fails if the username already exists', async () => {
  const newUser = {
    username: 'uniqueuser',
    name: 'Duplicate',
    password: 'password123'
  }

  // First creation succeeds
  await api.post('/api/users').send(newUser).expect(201)

  // Second creation should fail
  const result = await api.post('/api/users').send(newUser).expect(400)
  expect(result.body.error).toContain('username must be unique')
}, 10000)

})
afterAll(async () => {
  await mongoose.connection.close()
})