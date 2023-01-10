const express = require('express');
app=express.Router();
const auth=require("../../middleware/verifytoken");
const yourItem=require("../../middleware/itemOfWerkgever")
var mysql = require('mysql');
var {serverSecret}=require('../../serverSecret');
var connection=mysql.createPool(serverSecret.databaseLogin);


app.post("/add",auth,(req,res)=>{
    console.log("Start Add");
    if(req.user.isWerkgever){
        const data=req.body;
        console.log(data);
        connection.query('select id from gebruiker where roosterId=(select roosterId from gebruiker where id=?)',[req.user.id],(err,value)=>{
            console.log(value);
            var validUsers=data.users.every(value1 => value.some(value2 => value2.id ===value1));
            if(validUsers){
                var records=data.users.map(value =>[value,new Date(data.date),data.beginTijd,data.eindTijd]);
                connection.query("insert INTO  roosterItems(userId, datum, beginTijd, eindTijd)  VALUES ? ",[records],(err,values,fields)=>{
                   console.log(values);
                    console.log(fields);

                    if(err){
                        console.log("Add failed");
                        res.status(500).send(err)
                    }else {
                        connection.query("INSERT INTO Notifications (userId, messageType, roosterId) VALUES (?,3,(select roosterId from gebruiker where id=?))", [req.user.id,req.user.id], (error, results, fields) => {
                            if(error){
                                console.error(error)
                            }
                            console.log("notification added")
                        })
                        res.status(200).send(values)
                        console.log("Add succeed")
                    }
                })
            }else{
                console.log("Add failed");
                res.status(401).send("Sommige/alle werknemers behoren niet tot uw werknemers.")
            }
        })
    }else{
        console.log("Add failed");
        res.status(401).send("U bent geen werkgever")
    }
});


app.post("/change/:id",[auth,yourItem],(req, res) => {
    console.log(req.body.beginTijd);
    console.log(req.body.eindTijd);
    connection.query("update roosterItems set beginTijd=?,eindTijd=? where itemId=?",[req.body.beginTijd,req.body.eindTijd,req.params.id],(err,values,query)=>{
        if(err){
            res.status(500).send(err)
        }else{
            connection.query("INSERT INTO Notifications (userId, messageType, roosterId,roosterItemId) VALUES (?,?,(select roosterId from gebruiker where id=?),?)", [req.user.id, 3,req.user.id,req.params.id], (error, results, fields) => {
                if(error){
                    console.log(error)
                }else{
                    console.log("Melding gelukt!")
                    console.log(results)
                }

            })
            res.status(200).send("Gelukt!")
        }
    })
});

app.delete("/remove/:id",[auth,yourItem],(req, res) => {
    console.log("Start delete roosterItem");
    connection.query("delete from roosterItems where itemId=? ", [req.params.id], (err, values) => {
        if (err) {
            res.status(500).send(err);
            console.log("Delete Failed")
        } else {
            console.log("Delete Done")
            connection.query("INSERT INTO Notifications (userId, messageType, roosterId) VALUES (?,?,(select roosterId from gebruiker where id=?))", [req.user.id, 3,req.user.id], (error, results, fields) => {})

            res.status(200).send("Verwijderen Gelukt")

        }
    })
});

app.post("/get",auth,(req,res)=>{
    console.log("start get rooster");
    console.log(req.body);
    connection.query(`select rI.*,CONCAT(firstName,' ',lastName) as naam,itemId, state as status from gebruiker join roosterItems rI on gebruiker.id = rI.userId where ${req.user.isWerkgever? "roosterId=(select roosterId from gebruiker where id=?)" : "gebruiker.id=?" } and (datum >= ?) and (datum <= ?) `,[req.user.id,req.body.beginDatum,req.body.eindDatum],(err,values)=>{
        if(err){
            console.log("get rooster failed");
            res.status(500).send(err)
        }else{
            console.log("get rooster succeed");
            console.log(newValues);
            var newValues=values.map(value => {
                value.beginTijd=`1899-12-31T${value.beginTijd}.000`;
                value.eindTijd=`1899-12-31T${value.eindTijd}.000`;
                return value
            });
            res.status(200).json(newValues)
        }
    })
});

module.exports=app;