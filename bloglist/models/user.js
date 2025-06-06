const mongoose = require('mongoose')
const blog = require('./blog')

const userSchema = new mongoosse.Schema({
    username:String,
    name:String,
    passwordHash:String,
    blogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }] 
})

userSchema.set('toJSON',{
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
        delete returnedObject.passwordHash
    }
})
const User = mongoose.model('User', userSchema)

module.exports = User