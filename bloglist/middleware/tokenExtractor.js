const jwt = require('jsonwebtoken')

const tokenExtractor =(request,response,next) => {
    const authorization = request.get('authorization')
    if(authorization && authorization.startsWith('Bearer')){
        try{
            const token = authorization.replace('Bearer ', '')
            const decodedToken = jwt.verify(token,process.env.SECRET)
            if(!decodedToken.id){
                return response.status(401).json({error : 'token missing or invalid'})

            }
            request.user =decodedToken
        }catch(error){
            return response.status(401).json({error: 'token missing or invalid'})
        }
        }else{
            return response.status(401).json({error: 'authorization token invalid'})
        }
    next()
}
module.exports = tokenExtractor