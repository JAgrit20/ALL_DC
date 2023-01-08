let uidash = new Map();
var request = new Map();
const fetch = require("node-fetch");
var list =[];
var online = [];
var reject = [];
var collector={};var or=0;
var uniqid = require('uniqid');
var fs = require('fs');
var https = require('https');
var credentials = {key: fs.readFileSync('privkey_dcwebsite.pem'), cert:  fs.readFileSync('fullchain_dcwebsite.pem')};

var express = require('express');
var app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
var nodemailer = require('nodemailer');
const cors = require('cors')
const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtppro.zoho.in",
     auth: {
          user: 'accounts@doubtconnect.in',
          pass: 'tansu@123',
       },
  secure: true,
  });
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/notifyRegAdmin',(req,res)=>{
    console.log("new student jagrit",req.query);
    // EMAIL NOTIFY
    mailList=["raghavmishra3830@doubtconnect.in","vaibhav.lal@doubtconnect.in","anushkasharma.as.131@gmail.com","shambhaviupadhyay1902@gmail.com"]
    // mailList=['jagritacharya2019@gmail.com']
    const mailData = {
      from: 'accounts@doubtconnect.in',  // sender address
        to: mailList,   // list of receivers.
        subject: 'New Registration',
        text: 'New User registered',
        html: `<b>New Registration </b><br/>\n ${req.query.name} is a new student of DoubtConnect<br/>Phone number:${req.query.phno}<br/>Email:${req.query.email}<br/>grade:${req.query.grade}<br/>board:${req.query.board}<br/>language:${req.query.language}`,
      };
      console.log("sending mail now jagrit")
      transporter.sendMail(mailData, function (err, info) {
        if(err)
          {console.log(err)
          return res.status(400).json({ message: err });
        }
        else
          {
          console.log(info);
          return res.json({ message: 'notified' });
        }
      });
    //  return res.json({ message: 'Default response' });
  });
// Start the server
app.listen(3003, () => {
    console.log('Server listening on port 3000');
  });


  
