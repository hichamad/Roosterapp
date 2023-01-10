const express = require('express');
app = express.Router();
const nodemailer = require('nodemailer');
const roosterItemRoute = require('./apiRoutes/RoosterItemRoute');
const multer = require('multer');
const auth=require("../middleware/verifytoken");
const roosterStructuur=require("./apiRoutes/RoosterStructuur");
const accountRoute = require('./accountRoute');
const bcrypt = require('bcryptjs');


var mysql = require('mysql');
var {serverSecret}=require('../serverSecret');
var connection=mysql.createPool(serverSecret.databaseLogin);

var storage= multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/')
    },
    filename: (req,file,cb) =>{
        //
        if(file.fieldname === "profielFoto"){
            cb(null,"Profielfoto"+Date.now()+".png")
        }else{
            cb(null,"randow "+new Date().toDateString()+".png")
        }
    }
});


var upload=multer({storage:storage});

app.post("/addbedrijf",(req,res)=>{
    var data=req.body;
    console.log("posting:");
    connection.query("INSERT INTO bedrijf (name, phone, loc, pass, img_link) VALUES (?,?,?,?,?)",[data.name,data.phone,data.loc,data.pass,data.img_link], (error,results, fields)=>{
        console.log(error);
        if (error) {
            res.status(422);
            res.json({message:error});
        }else{
            res.send("Done!")
        }
    })
});

app.get("/avatar/:name",(req,res)=>{
    console.log("start getting avatar");
    console.log(__dirname.split("/"));
    res.sendFile(__dirname.split("\\").slice(0,-1).join("\\")+"/uploads/"+req.params.name);
    console.log("succeed getting avatar")
});

// ---------------- ACCOUNTS ----------------

app.get("/avatarWithId/:id",(req,res)=>{
    console.log("start getting avatar");
    connection.query("select profielFotoLink as avatar from gebruiker where id =?",[req.params.id],(err,values)=>{
        if(err){
            res.status(500).send(err)
        }else{
            console.log(values);
            if(values.length===0){
                res.status(400)
            }else{
                res.sendFile(__dirname.split("\\").slice(0,-1).join("\\")+"/uploads/"+values[0].avatar)
            }

        }
    });
console.log("succeed getting avatar")
});

app.get("/GetMedewerkers",auth, ((req, res) =>{
    if(req.user.isWerkgever){
        connection.query("SELECT id, firstName, lastName, CONCAT(firstName,' ',lastName) as naam FROM gebruiker WHERE roosterid = (select roosterId from gebruiker where id=?)", [req.user.id], ( err, result, val) => {
            res.status(200).json(result)
        });
    }else{
        res.status(401).send("Je bent geen werkgever")
    }
}));
// Zend een POST request dat de data uit de front-end in de database krijgt en daarmee een nieuwe gebruiker aanmaakt.
app.post("/addgebruiker", upload.single('profielFoto'), async (req, res) => {
    let data = req.body;
    let image = "defaultAvatar.png";

    if (req.file !== undefined) {image = req.file.filename;}
    data.pass = await bcrypt.hash(data.pass, 10 );
    connection.query("INSERT INTO gebruiker (firstName, lastName, email, pass, phone, birth, profielFotoLink, isWerkgever) VALUES (?,?,?,?,?,?,?,?)",[data.firstName, data.lastName, data.email, data.pass, data.phone, data.birth,image ,data.isWerkgever==='true'],
    (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(422).json;
            res.json({message:error});
        } else {
            res.json({addgebruikerSuccess: true});
            console.log(data.firstName + " toegevoegd.");

            // Hier wordt het verificatie-email verstuurd. Wanneer we ook op andere plekken email gaan gebruiken kan deze code centraler opgeslagen worden.
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'roosteritHRO@gmail.com',
                    pass: 'hogeschoolr'
                }
            });

            const mailOptions = {
                from: 'roosteritHRO@gmail.com',
                to: data.email,
                subject: 'Verificatie RoosterIt',
                html: `<h1 style="font-family: sans-serif;text-align: center;">Geachte meneer/mevrouw ${data.lastName},</h1><p style="text-align: center;font-family: sans-serif;">Bedankt voor uw registratie bij RoosterIT.<br> Klik op de volgende link om uw registratie te voltooien.</p><a href="http://localhost:3000/emailverificatie/${data.email}">Valideer account</a>`};

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email verstuurd: ' + info.response);
                }
            });
        }
    })
});

// Kijk in de database of de koppelcode al bestaat of niet.
app.post("/checkkoppelcode", (req, res) => {
    let data = req.body;
    connection.query("SELECT EXISTS (SELECT koppelCode FROM koppelCode WHERE koppelCode = ?) AS koppelcode",  [data.value], (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            results = results[0].koppelcode;
            res.json({koppelCodeCheck: results});
        }
    });
});

// Kijk in de database of het ingevoerde emailadres al gebruikt is.
app.post("/checkemail", (req, res) => {
    let data = req.body;
    connection.query("SELECT EXISTS (SELECT email FROM gebruiker WHERE email = ?) AS emailcheck", [data.email], (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            results = results[0].emailcheck;
            console.log(results);
            res.json({emailCheck: results});
        }
    });
});

// Voeg een rooster toe aan de database met de verstuurde naam.
app.post("/addrooster", (req, res) => {
    let data = req.body;
    connection.query("INSERT INTO rooster (roosterName) VALUES (?)", [data.roosterName], (error, results, fields) => {
        if (error) {
            console.log(error);
            res.json({message: error});
        } else {
            console.log("Rooster " + data.roosterName + " toegevoegd.");
        }
    });

    // Haal het roosterId op van het zojuist aangemaakte rooster.
    connection.query("SELECT roosterId FROM rooster WHERE roosterName = (?)", [data.roosterName], (error, results, fields) => {
        let roosterId = results[0].roosterId;

        // Voeg de gegenereerde koppelcode toe aan de database.
        connection.query("INSERT INTO koppelCode (koppelCode, roosterId) VALUES (?,?)", [data.koppelCodeWerkgever, roosterId], (error, results, fields) => {
            console.log("Koppelcode toegevoegd.");

            // Update in de gebruikerstabel de werkgever met het roosterId van het rooster dat hij heeft aangemaakt.
            connection.query("UPDATE gebruiker SET roosterId = ? WHERE email = ?", [roosterId, data.email], (error, results, fields) => {
                res.json({addroosterSuccess: true});
            });
        });
    });
});

// Sluit een werknemer aan bij het rooster van een werkgever.
app.put("/koppelgebruiker", (req, res) => {
    let data = req.body;

    // Haal het roosterId op van het rooster dat bij de ingevoerde koppelcode hoort.
    connection.query("SELECT roosterId FROM koppelCode WHERE koppelCode = ?", [data.koppelCodeWerknemer], (error, results, fields) => {
       let roosterId = results[0].roosterId;

        // Update in de gebruikerstabel de werknemer met het roosterId dat bij de ingevoerde koppelcode past.
       connection.query("UPDATE gebruiker SET roosterId = ? WHERE email = ?", [roosterId, data.email], (error, results, fields) => {
           res.json({koppelgebruikerSuccess: true});
           console.log("Gebruiker gekoppeld aan rooster " + roosterId);
       });
    });
});

// Activeer een gebruiker in de database nadat deze de link in de verificatie-email heeft gevolgd.
app.put("/activeergebruiker", (req, res) => {
    let data = req.body;
    console.log("Activeren gebruiker:");
    connection.query("UPDATE gebruiker SET verificatie = 1 WHERE email = (?)", [data.email], (error, results, fields) =>{
        res.json(results);
        console.log("Gebruiker geactiveerd.");
    });
});

// Update user via de accountpagina
app.put("/updategebruiker",auth, (req, res) => {
    let data = req.body;
    console.log("Updaten gebruiker...:");
    connection.query("UPDATE gebruiker SET firstName = (?), lastName = (?), email = (?), phone = (?) WHERE Id = (?)", [data.newVoornaam, data.newAchternaam, data.newEmail, data.newTelefoon, req.user.id], (error, results, fields) =>{
        res.json(results);
        if (error) {
            console.log(error);
        }
        console.log("Gebruiker geupdatet.");
    });
});

// Update user via de accountpagina
app.put("/updategebruiker2",auth, async (req, res) => {
    let data = req.body;
    data.newPassword = await bcrypt.hash(data.newPass, 10 );
    console.log("Updaten gebruiker... met wachtwoord" + data.newPassword);
    connection.query("UPDATE gebruiker SET firstName = (?), lastName = (?), email = (?), pass = (?), phone = (?) WHERE Id = (?)", [data.newVoornaam, data.newAchternaam, data.newEmail, data.newPassword, data.newTelefoon, req.user.id], (error, results, fields) =>{
        res.json(results);
        if (error) {
            console.log(error);
        }
        console.log("Gebruiker geupdatet.");
    });
});
// ---------------- NOTIFICATIES ----------------

app.post("/addnotif",async (req, res) => {
    console.log("Notificatie toevoegen: ");
    connection.query("INSERT INTO Notifications (userId, messageType, roosterId, roosterItemId, isForBoss, secondUser) VALUES (?,?,(select roosterId from gebruiker where gebruiker.id = ?),?,?,?)", [req.body.person, req.body.messageId, req.body.person, req.body.roosterItemId, req.body.isForBoss, req.body.secondUser],
        (error, results, fields) => {
            if (error) {
                console.log(error);
                res.status(422);
                res.json({message:error});
            }
            else {
                res.status(201).send("Notificatie toegevoegd.");
                console.log("Notificatie toegevoegd.")
            }
        })
});

app.post("/getnotifs", auth, (req, res) => {
    console.log("Getting notifs...");
    connection.query('SELECT CONCAT(firstName, " " , lastName) as name, messageType, profielFotoLink, roosterItemId, Notifications.id AS notifId, isForBoss FROM Notifications JOIN gebruiker ON Notifications.userId = gebruiker.id WHERE Notifications.roosterId = (select roosterId from gebruiker where id = ?) AND isForBoss = false OR isForBoss = ?  ORDER BY Notifications.id DESC', [req.user.id, req.body.isForBoss], (err, result, val) => {
        if (err !== null) {
            console.log(err);
            res.status(400).send(err)
        }
        else {
            console.log(result);
            res.json(result)
        }
    })
});

app.get("/GetMedewerkers",auth, ((req, res) =>{

   if(req.user.isWerkgever){
       connection.query("SELECT id, firstName, lastName FROM gebruiker WHERE roosterid = 1", [], ( err, result, val) => {
           res.json(result)
       });
   }

}));

app.post("/deleteUser",auth,((req,res) => {
    console.log(req.body);
    if(req.user.isWerkgever){
        connection.query("DELETE FROM gebruiker WHERE id = ?  ", [req.body.id], (err,values,field)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send()

            }
        })
    }else{
        res.status(401).send("Je bent geen werkgever")
    }
}));

app.get("/getNextShift", auth, (req, res) => {
    console.log("Getting next shift...");
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '/' + mm + '/' + dd;
    connection.query('SELECT datum, beginTijd, eindTijd FROM roosterItems WHERE (datum > ?) AND (userId = ?) ORDER BY datum LIMIT 1', [today, req.user.id], (err, result, val) => {
        if (err !== null) {
            console.log(err);
            res.status(500).send()
        }
        console.log(val);
        console.log(result);
        console.log("Next shift received!");
        res.json(result)
    })
});

app.get("/getgebruikerinfo",auth,async (req,res)=>{
    console.log("Get user info");
    connection.query("SELECT firstName, lastName, email, phone, pass, birth, profielFotoLink FROM roosterit.gebruiker where id= ?",[req.user.id], (error, results, fields) =>{
        res.json(results)
    });
});


app.post('/getRoosterAndPerson', auth, (req, res) => {
    console.log("Getting sick person's data...");
    connection.query("SELECT concat(firstName, ' ', lastName) as naam, beginTijd, eindTijd, datum, Notifications.userId FROM roosterit.Notifications LEFT JOIN roosterItems rI on Notifications.roosterItemId = rI.itemId LEFT JOIN gebruiker g on Notifications.userId = g.id WHERE Notifications.roosterItemId = ?", [req.body.roosterItemId], (error, results, fields) =>{
        console.log(results);
        res.json(results[0])
    });
});

app.post('/ziekMeld', auth, (req, res) => {
    console.log("Start ziekMeld");
    console.log(req.body.roosterItemId);
    connection.query("UPDATE roosterItems SET state = ? WHERE itemId = ?", [req.body.status, req.body.roosterItemId], (error, results, fields) =>{
        if(error){
            res.status(500).send(error);
            console.log('ziekMeld failed')
        }
        else {
            res.status(200).send();
            console.log('ziekMeld succeeded')
        }
    })
});

app.post('/ziekAccept', auth, (req, res) => {
    console.log("start ziekAccept");
    connection.query("UPDATE roosterItems SET userId = ?, state = 1 WHERE itemId = ?", [req.body.secondUser, req.body.roosterItemId], (error, results, fields) =>{
        if(error){
            res.status(500).send(error);
            console.log('ziekAccept failed', error)
        }
        else {
            res.status(200).send();
            console.log('ziekAccept succeeded')
        }
    })
});
app.post("/resetState", auth, (req, res) => {
    console.log("start resetState");
    connection.query("UPDATE roosterItems SET state = 1 WHERE itemId = ?", [req.body.roosterItemId], (error, results, fields) => {
        if(error){
            res.status(500).send(error);
            console.log("resetState failed, ", error)
        }
        else {
            res.status(200).send();
            console.log('resetState succeeded')
        }
    })
});

app.post('/delNotif', auth, (req, res) => {
    console.log("start delNotif");
    connection.query('DELETE FROM Notifications WHERE id = ?', [req.body.notifId], (error, results, fields) => {
        if(error){
            res.status(500).send(error);
            console.log('delNotif failed', error)
        }
        else {
            res.status(200).send();
            console.log('delNotif succeeded')
        }
    })
});

app.get("/getKoppelcode",auth,(req, res) => {
    if(req.user.isWerkgever){
        connection.query("select koppelcode from koppelCode where roosterId=(SELECT roosterId from gebruiker where id=?)",[req.user.id],(err,values)=>{
            if(err){
                res.status(401).send(err)
            }else{
                res.json(values[0].koppelcode)
            }
        })
    }else{
        res.status(401).send("Je bent geen werkgever")
    }
})

app.post('/getSecondUser', auth, (req, res) => {
    console.log('start getSecondUser');
    connection.query("SELECT concat(firstName, ' ', lastName) as naam, id FROM gebruiker WHERE id = (SELECT secondUser FROM Notifications WHERE Notifications.id = ?)", [req.body.notifId], (error, results, fields) => {
        if(error){
            res.status(500).send(error);
            console.log('getSecondUser failed', error)
        }
        else {
            res.status(200).send(results[0]);
            console.log('getSecondUser succeeded')
        }
    })
});

app.use("/rooster", roosterItemRoute);
app.use("/account", accountRoute);
app.use("/roosterstructuur",roosterStructuur);


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports=app;