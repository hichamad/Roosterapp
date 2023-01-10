const express = require('express');
app=express.Router();
const auth=require("../../middleware/verifytoken");
var mysql = require('mysql');
var {serverSecret}=require('../../serverSecret');
var connection=mysql.createPool(serverSecret.databaseLogin);


app.get("/get",auth,(req, res) => {
    if(req.user.isWerkgever){
        connection.query("select * from roosterStructuur where roosterId=(select roosterId from gebruiker where id=?)",[req.user.id],(err,value)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.json(value)
            }
        })
    }else{
        res.status(401).send("Je bent geen werkgever")
    }
})


module.exports=app