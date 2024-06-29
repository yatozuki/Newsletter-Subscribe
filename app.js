const express = require("express");
const https = require("node:https");
const bodyParser = require("body-parser");
const env = require('dotenv').config({path: ".env"});
const path = require('path');

const app = express();

function setHeaders(res, filePath) {
    if (path.extname(filePath) === '.css') {
      res.setHeader('Content-Type', 'text/css');
    }
  }
  
  app.use(express.static(__dirname + "/public", {
    setHeaders: setHeaders
  }));

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (req, res){
    res.sendFile(__dirname + "/subscribe.html");
});

app.post("/", function (req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const data = {
        members: [
            {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
                }
            }
        ]
    };

    const jsonData =JSON.stringify(data);

    const url = `https://us9.api.mailchimp.com/3.0/lists/${process.env.USER_ID}`;

    const options = {
        method: "POST",
        auth: `zin:${process.env.API_KEY}`
    }

    const request = https.request(url, options, function(response) {

        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        response.on("data", function(data){
            console.log(JSON.parse(data));
        })
    })
    request.write(jsonData);
    request.end();
})

app.post("/info", function(req, res){
    res.redirect("/");
})


app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port 3000.");
});
