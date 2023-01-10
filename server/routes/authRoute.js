const express=require("express");
router=express.Router();
const mysql = require('mysql');
const jwt=require("jsonwebtoken");
const bcrypt = require('bcryptjs');
var {serverSecret}=require('../serverSecret');

var connection=mysql.createPool(serverSecret.databaseLogin);

const expireTime="5m";

router.post("/Login", (req,res) => {
    console.log(req.body);
    connection.query("SELECT email,pass,id,verificatie=1 as verificatie,isWerkgever =1 as isWerkgever FROM gebruiker where email = ?", [req.body.email], (err, values, fields) => {
        console.log("Got data from Database");
        console.log(err)
            if (err || values.length === 0) {
                res.status(401).send("Wachtwoord of E-mail niet geldig")
            } else {
                if (values[0].verificatie) {
                    (bcrypt.compare(req.body.pass, values[0].pass, (err, result) => {
                        if (err) {
                            console.error(err)
                        }
                        if (result) {
                            var payLoad = {id: values[0].id,isWerkgever: values[0].isWerkgever === 1};
                            var sessionToken = jwt.sign(payLoad, serverSecret.sessionSecret, {expiresIn: expireTime});
                            var refreshToken = jwt.sign(payLoad, serverSecret.refreshSecret);
                            connection.query("INSERT INTO authsessions(refreshToken, gebruikerId, tokenCreated,tokenLastUsed) value (?,?,current_timestamp,current_timestamp)", [refreshToken, values[0].id], (err, values, fiels) => {
                                if (err) {
                                    res.status(502).send(err)
                                } else {
                                    res.status(200).json({sessionToken: sessionToken, refreshToken: refreshToken})
                                }
                            })
                        } else {
                            res.status(401).send("Wachtwoord of E-mail niet geldig")
                        }
                    }))
                } else {
                    res.status(401).send("Mail is niet geverifieerd")
                }
            }

    });

});

router.get("/refresh",(req, res) => {
    console.log("Refresh");
    connection.query("SELECT *  FROM authsessions WHERE refreshToken=?",[req.header("refreshToken")],(err,values)=>{
        if(err){
            res.status(401).send()
        }
        console.log(values)
        if(values.length!==0){
            const token=req.header("refreshToken");
            jwt.verify(token,serverSecret.refreshSecret,(err1, decoded) => {
                if(err1){
                    res.status(401).send()
                }else{
                    connection.query("UPDATE authsessions SET tokenLastUsed=CURRENT_TIMESTAMP WHERE refreshToken=?",[values[0].refreshToken]);
                    const authToken=jwt.sign({id:decoded.id,isWerkgever: decoded.isWerkgever},serverSecret.sessionSecret,{expiresIn:expireTime});
                    res.status(200).send(authToken)
                }
            })
        }else{
            res.status(401).send()
        }
    })
});

router.get("/Medewerkers", );


router.delete("/logout",((req, res) => {
    console.log(req.header("refreshToken"));
    console.log("hello");
    connection.query("DELETE FROM authsessions WHERE `refreshToken` = ? ",[req.header("refreshToken")],(err,values)=>{
        if(err){
            res.status(400).send()
        } else {
            res.status(200).send()
        }
    })
}));


module.exports=router;