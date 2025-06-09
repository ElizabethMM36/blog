const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const tokenExtractor =(request,response,next) => {
    const authorization = request.get('authorization')
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        const token = authorization.substring(7)
        request.token = token
        console.log('TOKEN:', token)
        console.log('SECRET used:', config.SECRET)
        try{
        
            const decodedToken = jwt.verify(token, config.SECRET)
            if(!decodedToken.id){
                return response.status(401).json({error : 'token missing or invalid'})

            }
            request.token = token
            request.user =decodedToken
            
            next()
        }catch(error){
            return response.status(401).json({error: 'token missing or invalid'})
        }
        }else{
            request.token = null
            return response.status(401).json({error: 'authorization token invalid'})
        }
 
    
}
module.exports = tokenExtractor