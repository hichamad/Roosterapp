const jwt = require('jsonwebtoken');
const serverSecret=require("../serverSecret")

module.exports=function auth (req,res,next){
    const token = req.header("authToken")
    console.log(req.header("authToken"))
    console.log(!token)
    if(!token) return res.status(401).send('Acces denied');

    try{
        const verified = jwt.verify(token, serverSecret.serverSecret.sessionSecret);
        req.user = verified;
        next()
    }catch(err){
       res.status(400).send('invalid token');
    }
}
