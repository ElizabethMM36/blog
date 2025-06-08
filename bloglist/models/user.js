const mongoose = require('mongoose')
const blog = require('./blog')

const userSchema =  new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3},
    name:String,
    passwordHash:{type: String,
        required:true,
        minlength:3
    },
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