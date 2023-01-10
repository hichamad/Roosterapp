const express = require('express');
app = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const multer = require('multer');
const {serverSecret} = require('../serverSecret');
const connection = mysql.createPool(serverSecret.databaseLogin);


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) =>{
        if(file.fieldname === "profielFoto") {
            cb(null,"Profielfoto"+Date.now()+".png")
        }else{
            cb(null, "randow " + new Date().toDateString() + ".png")
        }
    }
});

const upload = multer({storage:storage});

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
                    html: `<h1 style="font-family: sans-serif;text-align: center; font-size: 20px;color: #3f3f3f;">Geachte meneer/mevrouw ${data.lastName},</h1><p style="text-align: center;font-family: sans-serif;">Hartelijk dank voor uw registratie bij RoosterIT. Om uw registratie te voltooien dient u uw account eerst te verifiëren.<br> Klik op de knop hier beneden om uw e-mailadres te verifiëren.</p><a href="http://localhost:3000/emailverificatie/${data.email}" class="myButton" style="-moz-border-radius:42px;-webkit-border-radius:42px;background-color:#ac35d7;text-align: center;border:4px solid #bb83cd;border-radius:42px;color:#fff;cursor:pointer;display:block;font-family:Trebuchet MS;font-size:18px;padding:10px 31px;text-decoration:none;margin:auto; width:250px;">Verifieer account</a>`};

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

// Kijk in de database of de koppelcode die een werknemer invoert al bestaat of niet.
app.post("/checkkoppelcodewerknemer", (req, res) => {
    let data = req.body;
    connection.query("SELECT EXISTS (SELECT koppelCode FROM koppelCode WHERE koppelCode = ?) AS koppelcode",  [data.koppelCodeWerknemer], (error, results, fields) => {
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
            res.json({emailCheck: results});
        }
    });
});

// Kijk in de database of het ingevoerde emailadres al gebruikt is.
app.post("/checkpassword", async (req, res) => {

    let data = req.body;
    connection.query("SELECT pass FROM gebruiker WHERE email = ?", [data.email], (error, results, fields) => {
        if(error){
            console.log(error)
            res.status(500).send(error)
        }else{
            console.log(results)
            bcrypt.compare(data.oldpassword, results[0].pass, (err, result) => {

                if (err) {
                    res.status(500).send(err)
                    console.error(err)


                }else{
                    console.log(results)
                    res.json(result);
                }
            })
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

module.exports = app;