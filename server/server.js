const express = require('express');
const cors= require('cors');
const path = require("path");
serverSecret=require('./serverSecret');
authRoute=require('./routes/authRoute');
apiRoute=require("./routes/apiRoute");




var app = express();
app.use(cors({origin:"http://localhost:3000",credentials:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));


app.use("/api",apiRoute);
app.use("/auth",authRoute);

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'../client/build/index.html'));
});


app.listen(5000,()=> {
    console.log("listening")

});