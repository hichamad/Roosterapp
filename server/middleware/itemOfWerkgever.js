var mysql = require('mysql');
var {serverSecret}=require('../serverSecret');
var connection=mysql.createPool(serverSecret.databaseLogin);


module.exports=function itemOfWerkgever(req, res, next) {
    if(req.user.isWerkgever){
        connection.query("select id from roosterItems join gebruiker on roosterItems.userId = gebruiker.id where (select roosterId from gebruiker where id=?)=roosterId and roosterItems.itemId=?",[req.user.id,req.params.id],(err,values)=>{
            if(err){
                res.status(500).send(err)
            }else{
                if(values.length===0){
                    res.status(401).send("Waarschijnlijk heb je geen toegang tot het wijzigen van dit item")
                }else{
                    next()
                }
            }

        })

    }else{
        res.status(401).send("User is geen werkgever")
    }
}
