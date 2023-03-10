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
var credentials = {key: fs.readFileSync('/var/www/html/privkey_dcwebsite.pem'), cert:  fs.readFileSync('/var/www/html/fullchain_dcwebsite.pem')};

var express = require('express');
var app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
var nodemailer = require('nodemailer');
var config = require('/var/www/html/test_config.json');
const crypto = require('crypto');
var admin = require('firebase-admin');
var defaultAppConfig = {credential: admin.credential.cert(require("/var/www/html/student_config.json")), databaseURL: "https://doubtconnect-a1cf3.firebaseio.com/"}
var defaultApp = admin.initializeApp(defaultAppConfig,'default');
var otherAppConfig = {credential: admin.credential.cert(require("/var/www/html/tutor_config.json")), databaseURL: "https://doubtconnect-teachers.firebaseio.com/"}
var otherApp = admin.initializeApp(otherAppConfig, 'other');
var db = otherApp.database();
var sdb = defaultApp.database()
console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',defaultApp.name)
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
// app.use(cors({
//   origin: 'https://webapp.doubtconnect.in',
//   methods: ['GET', 'POST']
// }));

app.get('/', function(request, response){
  response.send("Welcome To the DC SEVER! --HK")
});
app.post('/updatentoken', function(request, response){
 // response.header("Access-Control-Allow-Origin", "*");
  if(uidash.get(request.body.uid)== undefined | uidash.get(request.body.uid)!=request.body.token){
  uidash.set(request.body.uid,request.body.token);
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',uidash)
  response.json({ token: 'updated' });   // echo the result back
  }
});
app.post('/orderid-i', function(request, response){
  response.send(uniqid('Order'))
});

app.post('/payment-r', function(request, response){
  var data = request.body
  console.table(data)
  var signature = request.body.signature
  var secretKey =  config.secretKey
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',secretKey)
  signatureData = "";
  signatureData = data["orderId"] + data["orderAmount"] + data["referenceId"] + 
                  data["txStatus"] + data["paymentMode"] + data["txMsg"] + data["txTime"];
                  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',signatureData)
  var derivedSignature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',derivedSignature)
  
  if(derivedSignature !== signature || data["txStatus"]==="FAILED"){
    response.redirect("https://webapp.doubtconnect.in/student/payment/failure")
     console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"not-success")
  }
  else if(data["txStatus"]==="CANCELLED"){
    response.redirect("https://webapp.doubtconnect.in/student/")
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"cancelled")
  }
  else
  {
    var payment_url = "https://webapp.doubtconnect.in/student/payment/success/" + data["orderAmount"]
    response.redirect(payment_url)
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"success")
  }
  
});

app.post('/payment-i', function(request, response){
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);
  
  var data = request.body
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data)
  var signature = request.body.signature
  var secretKey =  config.secretKey
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',secretKey)
  signatureData = "";
  signatureData = data["orderId"] + data["orderAmount"] + data["referenceId"] + 
                  data["txStatus"] + data["paymentMode"] + data["txMsg"] + data["txTime"];
  var derivedSignature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',derivedSignature)
  if(derivedSignature !== signature){
     response.send("there was a missmatch in signatures genereated and received")
     console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"not-success")
  }
  else
  {
      response.send("payment success")
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"success")
  }
});


app.post('/payment-get', function(request, response){
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',request.body);
var  payemnt_info = request.body;
});

app.post('/register-tags', function(request, response){
  var tag = request.body.tags
  var uid = request.body.uid;
  var success = false
  tag = tag.replace(/[.]/g,'');
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',uid," ", tag)
  const reff = db.ref('Tags/');
  var tokens = tag.split("|")
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',tokens)
  tokens.forEach(function(value){
    reff.child(value).push(uid, (error) => {
      if (error) {
        console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Data could not be saved.' + error);
      } else {
        console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Data saved successfully.');
        success = true
      }
    });
  });
  response.send("Saved SuccessFully")
});
app.post('/sendfcm-i', function(req, res) {

  const data = { messaging_product:"whatsapp",
  to: "919176371853",
  type: "template",
  template: { name: "new_doubt", language: {code: "en_US" } } 
  }

fetch('https://graph.facebook.com/v13.0/101630129338779/messages', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer EAAIXQ94V2MIBAIqGiSM2997sow7F4DNocRnZBGxJabEsDDHwVBZCczpZArAKOGVTZArPShwFKZCsmjodr5RiA95cb6hEZBr9nnJ6zlVZAA0v4d0odbMNPuF1Vbj8lB0XAlFeC6CK5SNwyN2i2R3nIu0wxht0QUdN3QEOku66uKAJYLSgIh0u2tIKY0aHIztSq7Cf8ctZBzPZBOAZDZD'

  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((data) => {
    console.log('Success jagrit:', data);
  })
  .catch((error) => {
    console.error('Error jagrit:', error);
  });

  online = [];
  list=[];
  var image_url = req.body.url;
  var subject = req.body.subject;
  var grade = req.body.grade;
  var session_id = uniqid('instant')
  var lang = req.body.lang;
  var slang =req.body.slang;
  var board = req.body.board;
  var chapter = req.body.chapter;
  var topic = req.body.topic;
  var uidstudent = req.body.sname;
  request.set(session_id,req.body.tokens) 
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"kk0",request)
  collector[session_id] = [];
      collector[session_id][0] = {acrc: 0};
      collector[session_id][0]["phase"]="one";
      collector[session_id][0]["rf"]="no";
      collector[session_id][0]["rsend"]=[];
      collector[session_id][0]["uidstudent"]=req.body.sname;
      collector[session_id][0]["image_url"]=req.body.url;
      collector[session_id][0]["subject"]=req.body.subject;
      collector[session_id][0]["grade"]=req.body.grade;
      collector[session_id][0]["session_id"]=session_id;
      collector[session_id][0]["lang"]=req.body.lang;
      collector[session_id][0]["slang"]=slang;// secondary lang 
      collector[session_id][0]["board"]=req.body.board;
      collector[session_id][0]["chapter"]=req.body.chapter;
      collector[session_id][0]["topic"]=req.body.topic;
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"collector=>>",collector[session_id])
      console.log("collector")
      or++;

    db.ref("Users").orderByChild("status").equalTo("online").once("value", function(snapshot) {
        snapshot.forEach(function(data) {
            console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.key)
            online.push(data.key)
            console.log("online is here")
            console.log(online,"online")
        })
    });
   // var request1 = "cbse-12-physics-1.2 refraction".replace(/[.]/g,'')
    var request1 = board+"-"+grade+"-"+subject+"-"+lang+"-"+chapter+"-"+topic
    request1 = request1.replace(/[.]/g,'')
    db.ref("Tags").child(request1).once("value", function(snapshot) {
      console.log("snapshot is here",snapshot.val())
        snapshot.forEach(function(data) {
            console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.val())
            console.log("data is here",data.val())
            if(online.includes(data.val()))
            {
              if(!list.includes(uidash.get(data.val()))){
                console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"first phase uid: ",data.val())
                list.push(uidash.get(data.val()));
                console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"kaia",list)
                collector[session_id][0]["rsend"].push(uidash.get(data.val()));
              }
            }
        })
        console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list,"koioio");
        if(list.length!=0){
      sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"one",uidstudent);    
    }
    });

    
    res.send(session_id)
});

// ********************************** response **************************//
app.post('/response-i', function(req, res) {
  // name,lang,exp,state,city,rating,uid,nds(no. of doubts solved)
  //create a list
  
  console.log ("Accepting doubt");
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"Collec->>",collector);
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',req.body);
    collector[req.body.uid][0]["acrc"]+=1;
    collector[req.body.uid].push(req.body);
     //think2
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',collector[req.body.uid]);
    res.send("res recorded wait 90sec")
  });
  // ********************************** response PHASE-N(1,2,3,4) **************************//
  app.post('/response-i1', function(req, res){

  //  return res.json({ message: 'Default response' });
    
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',req.body)
    //need pr of doubt_image,subject,grade,sid,lang,chaoter,topic
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"Collec->>",collector);
    if(collector[req.body.uid][0]["rf"]!="yes")    //rf -request finished 
  {
    collector[req.body.uid][0]["rf"]=="yes"
    var image_url = collector[req.body.uid][0]["image_url"];
    var subject = collector[req.body.uid][0]["subject"];
    var grade = collector[req.body.uid][0]["grade"];
    var session_id = collector[req.body.uid][0]["session_id"];
    var lang = collector[req.body.uid][0]["lang"];
    var board = collector[req.body.uid][0]["board"];
    var chapter = collector[req.body.uid][0]["chapter"];
    var topic = collector[req.body.uid][0]["topic"];
    var slang = collector[req.body.uid][0]["slang"];
    var uidstudent = collector[session_id][0]["uidstudent"];
    list = [];
    online = [];
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"Collector->>",collector)
    if(collector[req.body.uid][0]["acrc"]==1){
      res.send("done")
      or--;  //delete request t1 - send request to all the tutors for expiry
      var token_final = request.get(req.body.uid);
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"uid-3",req.body.uid)
      sendfcms(token_final,req.body.uid,1,1)
      // sendfcmtexpired(collector[req.body.uid][0]["rsend"],image_url,subject,grade,session_id,lang,board,chapter,topic,collector[req.body.uid][0]["phase"]);
    }
    else if(collector[req.body.uid][0]["acrc"]==3){
      res.send("done")
      or--;  //delete request t1 - send request to all the tutors for expiry
      var token_final = request.get(req.body.uid);
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"uid-3",req.body.uid)
      sendfcms(token_final,req.body.uid,3,1)
      sendfcmtexpired(collector[req.body.uid][0]["rsend"],image_url,subject,grade,session_id,lang,board,chapter,topic,collector[req.body.uid][0]["phase"]);
      
    }
  else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'one')){
    // drop tags 
    res.send("again")
    collector[req.body.uid][0]["rf"]=="no"
  
    db.ref("Users").orderByChild("status").equalTo("online").once("value", function(snapshot) {
      snapshot.forEach(function(data) {
          console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.key)
          online.push(data.key)
      })
  });
  //var request1 = "cbse-12-physics-english".replace(/[.]/g,'')
  var request_tag = board+"-"+grade+"-"+subject+"-"+lang
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"Collector->",collector)
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',request_tag,"kokkokokokokok")
  db.ref("Tags").child(request_tag).once("value", function(snapshot) {
      snapshot.forEach(function(data) {
         // console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.val(),"online")
          //console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',online,list,collector[req.body.uid][0]["rsend"])
          if((online.includes(data.val()))&&(!list.includes(uidash.get(data.val())))&&
              (!collector[req.body.uid][0]["rsend"].includes(uidash.get(data.val())))){
                list.push(uidash.get(data.val()));
                //console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list,"one");
                collector[req.body.uid][0]["rsend"].push(uidash.get(data.val()));
              }
      })
      collector[req.body.uid][0]["phase"]="two";
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list,"one");
        if(list.length!=0)
        sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"two",uidstudent);
      //console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',final)
  });

}
  else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'two')){
    // drop board 
    res.send("again")
    collector[req.body.uid][0]["rf"]=="no"
  
        db.ref("Users").orderByChild("status").equalTo("online").once("value", function(snapshot) {
          snapshot.forEach(function(data) {
              console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.key)
              online.push(data.key)
          })
      });

       // var request1 = "12-physics-english-p" //primarylanguage
        var requesti = grade+"-"+subject
        db.ref("Tags").child(requesti+"-"+lang+"-p").once("value", function(snapshot) {
            snapshot.forEach(function(data) {
                //console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.val())
                if((online.includes(data.val()))&&(!list.includes(uidash.get(data.val())))&&
                    (!collector[req.body.uid][0]["rsend"].includes(uidash.get(data.val())))){
                      list.push(uidash.get(data.val()));
                      collector[req.body.uid][0]["rsend"].push(uidash.get(data.val()));
                    }
            })
            console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list,"two-lang");
          });
        var request2 = slang.split(" ")
        request2.forEach(function(value){
          console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',value);
          console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"rsend-twolang",collector[req.body.uid][0]["rsend"])
          db.ref("Tags").child(requesti+"-"+value).once("value", function(snapshot) {
            snapshot.forEach(function(data) {
                console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',data.val())
                if((online.includes(data.val()))&&(!list.includes(uidash.get(data.val())))&&
                    (!collector[req.body.uid][0]["rsend"].includes(uidash.get(data.val())))){
                      list.push(uidash.get(data.val()));
                      collector[req.body.uid][0]["rsend"].push(uidash.get(data.val()));
                    }
            })
            
        });
      });
      collector[req.body.uid][0]["phase"]="three";
            console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list,"two");
              if(list.length!=0)
              sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"three",uidstudent);
        
        
      }
      else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'three')){
        // drop board 
        if(collector[req.body.uid][0]["acrc"]==0){
          res.send("no1")
          //here
          
      // EMAIL NOTIFY
  mailList=["accounts@doubtconnect.in","raghavmishra3830@doubtconnect.in","vaibhav.lal@doubtconnect.in","anushkasharma.as.131@gmail.com","founders@doubtconnect.in","shambhaviupadhyay1902@gmail.com"]
  // mailList=['jagritacharya2019@gmail.com']
  const mailData = {
    from: 'accounts@doubtconnect.in',  // sender address
      to: mailList,   // list of receivers
      subject: 'No Tutor found',
      text: 'No tutor found',
      html: `<b>User with details:</b><br/>\n Doubt Image: ${image_url} <br/>,Uuid:${uidstudent} <br/>,grade: ${grade} <br/>,subject: ${subject} <br/> Didnt got response from any tutor`,
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
         // activate_tutor(req.body.uid)
         // sendfcmtexpired(collector[req.body.uid][0]["rsend"],image_url,subject,grade,session_id,lang,board,chapter,topic,collector[req.body.uid][0]["phase"]);
        }
        else{
          res.send("done15")
          or--;
         console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"uid-body",request)
          console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',collector[req.body.uid][0]["rsend"],"rsend - empty?")
          sendfcms(request.get(req.body.uid),req.body.uid,collector[req.body.uid][0]["acrc"],0) //show what we got
          sendfcmtexpired(collector[req.body.uid][0]["rsend"],image_url,subject,grade,session_id,lang,board,chapter,topic,collector[req.body.uid][0]["phase"]);
         
        }
        }
      else{
        or--;
        res.send("done")
        student(req.body.uid)
      }
    }
  });
  app.post('/response-ilate', function(req, res) {  //for tutor coming online
    
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',req.body);
      if(collector[req.body.uid]){
        collector[req.body.uid][0]["acrc"]+=1;
       //think2
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',collector);console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',or);
      res.send("res recorded wait 90sec")
      if (collector[req.body.uid][0]["acrc"]==3) {
        activate_student(req.body.uid)
        delete collector[req.body.uid];or--; }
      }
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

function sendfcmt(a,image_url,subject,grade,session_id,lang,board,chapter,topic,phase,uidstudent){
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',a,"jj","lenght ",a.length)
  // if(a.length==1)
  // a=a[0];
    //res.send("wait sending to all");
    var message = {
      notification: {
          title: 'New doubt',
          body: 'Click to View doubt',
          image: image_url
        },
        
        android: {
          ttl: 0,
          notification: {
            image: image_url
          },
          data:{
            "response": "newr",
            "uid": session_id,
            "image-url": image_url,
            "subject": subject,
            "grade": grade,
            "type": "instant",
            "expired": "NO",
            "chapter": chapter,
            "topic": topic,
            "lang": lang,
            "board": board,
            "phase": phase,
            "uidstudent": uidstudent
          },
          },
        webpush: {
          headers: {
            
            image: image_url
        },
        data:{
          "response": "newr",
          "uid": session_id,
          "image-url": image_url,
          "subject": subject,
          "grade": grade,
          "type": "instant",
          "expired": "NO",
          "chapter": chapter,
          "topic": topic,
          "lang": lang,
          "board": board,
          "phase": phase,
          "uidstudent": uidstudent
        },
        fcm_options: {
          "link": "https://webapp.doubtconnect.in/tutor"},
        
      },
      
      tokens: a //testing purpose change to // tokens: a // for more clients upto 500
     };

     var message1 = {
      notification: {
          title: 'New doubt',
          body: 'Click to View doubt',
          image: image_url
        },
        
        android: {
          ttl: 0,
          notification: {
            image: image_url
          },
          data:{
            "response": "newr",
            "uid": session_id,
            "image-url": image_url,
            "subject": subject,
            "grade": grade,
            "type": "instant",
            "expired": "NO",
            "chapter": chapter,
            "topic": topic,
            "lang": lang,
            "board": board,
            "phase": phase,
            "uidstudent": uidstudent
          },
          },
        webpush: {
          headers: {
            
            image: image_url
        },
        data:{
          "response": "newr",
          "uid": session_id,
          "image-url": image_url,
          "subject": subject,
          "grade": grade,
          "type": "instant",
          "expired": "NO",
          "chapter": chapter,
          "topic": topic,
          "lang": lang,
          "board": board,
          "phase": phase,
          "uidstudent": uidstudent
        },
        fcm_options: {
          "link": "https://webapp.doubtconnect.in/tutor"},
        
      },
      
      token: a[0] //testing purpose change to // tokens: a // for more clients upto 500
     };
  
// Send a message to the device corresponding to the provided
// registration token.
//console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',message)
if(a.length!=1)
{
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"message-a-length ",a.length)
  otherApp.messaging().sendMulticast(message)
  .then((response) => {
    // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
  })
  .catch((error) => {
    
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
  });
}
else{

  otherApp.messaging().send(message1)
  .then((response) => {
    // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
  })
  .catch((error) => {
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
  });
}
}
function sendfcms_mix(token,uid,i,type,k){
  if(type==2){
    var uidt_index=[]
    for (let j = 1; j <=collector[uid][0]["acrc"]; j++) 
  {   if(k.includes(collector[uid][j]['uidt']))
        uidt_index.push(j)
  }
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"uid_index: ",uidt_index)
    if (i==3) {
      message = {
       
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0,
            data:{
              "command": "3",
              "name1": collector[uid][uidt_index[0]]['name'],
               "lang1": collector[uid][uidt_index[0]]['lang'],
               "exp1": collector[uid][uidt_index[0]]['exp'],
               "state1": collector[uid][uidt_index[0]]['state'],
               "rating1": collector[uid][uidt_index[0]]['rating'],
               "iurl1": collector[uid][uidt_index[0]]['turl'],
               "sid1": collector[uid][uidt_index[0]]['uid'],
               "uidt1": collector[uid][uidt_index[0]]['uidt'],
    
                "name2": collector[uid][uidt_index[1]]['name'],
                "lang2": collector[uid][uidt_index[1]]['lang'],
                "exp2": collector[uid][uidt_index[1]]['exp'],
                "state2": collector[uid][uidt_index[1]]['state'],
                "rating2": collector[uid][uidt_index[1]]['rating'],
                "iurl2": collector[uid][uidt_index[1]]['turl'],
                "sid2": collector[uid][uidt_index[1]]['uid'],
                "uidt2": collector[uid][uidt_index[1]]['uidt'],
             
               "name3": collector[uid][uidt_index[2]]['name'],
                "lang3": collector[uid][uidt_index[2]]['lang'],
                "exp3": collector[uid][uidt_index[2]]['exp'],
                "state3": collector[uid][uidt_index[2]]['state'],
                "rating3": collector[uid][uidt_index[2]]['rating'],
                "iurl3": collector[uid][uidt_index[2]]['turl'],
                "sid3": collector[uid][uidt_index[2]]['uid'],
                "uidt3": collector[uid][uidt_index[2]]['uidt']
             
           },
        },
        webpush: {
          headers: {
            TTL:"0",
        },
        data:{
          "command": "3",
          "name1": collector[uid][uidt_index[0]]['name'],
           "lang1": collector[uid][uidt_index[0]]['lang'],
           "exp1": collector[uid][uidt_index[0]]['exp'],
           "state1": collector[uid][uidt_index[0]]['state'],
           "rating1": collector[uid][uidt_index[0]]['rating'],
           "iurl1": collector[uid][uidt_index[0]]['turl'],
           "sid1": collector[uid][uidt_index[0]]['uid'],
           "uidt1": collector[uid][uidt_index[0]]['uidt'],

            "name2": collector[uid][uidt_index[1]]['name'],
            "lang2": collector[uid][uidt_index[1]]['lang'],
            "exp2": collector[uid][uidt_index[1]]['exp'],
            "state2": collector[uid][uidt_index[1]]['state'],
            "rating2": collector[uid][uidt_index[1]]['rating'],
            "iurl2": collector[uid][uidt_index[1]]['turl'],
            "sid2": collector[uid][uidt_index[1]]['uid'],
            "uidt2": collector[uid][uidt_index[1]]['uidt'],
         
           "name3": collector[uid][uidt_index[2]]['name'],
            "lang3": collector[uid][uidt_index[2]]['lang'],
            "exp3": collector[uid][uidt_index[2]]['exp'],
            "state3": collector[uid][uidt_index[2]]['state'],
            "rating3": collector[uid][uidt_index[2]]['rating'],
            "iurl3": collector[uid][uidt_index[2]]['turl'],
            "sid3": collector[uid][uidt_index[2]]['uid'],
            "uidt3": collector[uid][uidt_index[2]]['uidt']
         
       },
      },
      token: token
     }; 
    }
    if (i==2) {
      message = {
        
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0,
            data:{
              "command": "2",
              //test collector
               "name1": collector[uid][uidt_index[0]]['name'],
               "lang1": collector[uid][uidt_index[0]]['lang'],
               "exp1": collector[uid][uidt_index[0]]['exp'],
               "state1": collector[uid][uidt_index[0]]['state'],
               "rating1": collector[uid][uidt_index[0]]['rating'],
               "iurl1": collector[uid][uidt_index[0]]['turl'],
               "sid1": collector[uid][uidt_index[0]]['uid'],
               "uidt1": collector[uid][uidt_index[0]]['uidt'],
    
                "name2": collector[uid][uidt_index[1]]['name'],
                "lang2": collector[uid][uidt_index[1]]['lang'],
                "exp2": collector[uid][uidt_index[1]]['exp'],
                "state2": collector[uid][uidt_index[1]]['state'],
                "rating2": collector[uid][uidt_index[1]]['rating'],
                "iurl2": collector[uid][uidt_index[1]]['turl'],
                "sid2": collector[uid][uidt_index[1]]['uid'],
                "uidt2": collector[uid][uidt_index[1]]['uidt']
             
           },
        },
        webpush: {
          data:{
            "command": "2",
            //test collector
             "name1": collector[uid][uidt_index[0]]['name'],
             "lang1": collector[uid][uidt_index[0]]['lang'],
             "exp1": collector[uid][uidt_index[0]]['exp'],
             "state1": collector[uid][uidt_index[0]]['state'],
             "rating1": collector[uid][uidt_index[0]]['rating'],
             "iurl1": collector[uid][uidt_index[0]]['turl'],
             "sid1": collector[uid][uidt_index[0]]['uid'],
             "uidt1": collector[uid][uidt_index[0]]['uidt'],
  
              "name2": collector[uid][uidt_index[1]]['name'],
              "lang2": collector[uid][uidt_index[1]]['lang'],
              "exp2": collector[uid][uidt_index[1]]['exp'],
              "state2": collector[uid][uidt_index[1]]['state'],
              "rating2": collector[uid][uidt_index[1]]['rating'],
              "iurl2": collector[uid][uidt_index[1]]['turl'],
              "sid2": collector[uid][uidt_index[1]]['uid'],
              "uidt2": collector[uid][uidt_index[1]]['uidt']
           
         },
          headers: {
            TTL:"0",
        },
      },
      token: token
     }; 
    }
    if (i==1) {
      message = {
       
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0, 
            data:{
              "command": "1",
                "name1": collector[uid][uidt_index[0]]['name'],
                "lang1": collector[uid][uidt_index[0]]['lang'],
                "exp1": collector[uid][uidt_index[0]]['exp'],
                "state1": collector[uid][uidt_index[0]]['state'],
                "rating1": collector[uid][uidt_index[0]]['rating'],
                "iurl1": collector[uid][uidt_index[0]]['turl'],
                "sid1": collector[uid][uidt_index[0]]['uid'],
                "uidt1": collector[uid][uidt_index[0]]['uidt']
             },
        },
        webpush: {
          headers: {
            TTL:"0",
            
        },
        data:{
          "command": "1",
            "name1": collector[uid][uidt_index[0]]['name'],
            "lang1": collector[uid][uidt_index[0]]['lang'],
            "exp1": collector[uid][uidt_index[0]]['exp'],
            "state1": collector[uid][uidt_index[0]]['state'],
            "rating1": collector[uid][uidt_index[0]]['rating'],
            "iurl1": collector[uid][uidt_index[0]]['turl'],
            "sid1": collector[uid][uidt_index[0]]['uid'],
            "uidt1": collector[uid][uidt_index[0]]['uidt']
         },
      },
      token: token
     }; 
    }

  }
    // send tutor
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"sendfcms final message: ",message)
   defaultApp.messaging().send(message)
  .then((response) => {
   // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);})
    .catch((error) => {
       console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending messaget:', error);
      });
}


  function sendfcms(token,uid,i,type)  //t1 sort acc type 
  {
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"uid-sendfcms",uid)
    var message ;
    if(type==1||type==0){
    if (i==0) {
      message = {
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0,
             data:{
             "command": "0",
            }
        },
      token: token
     }; 
    }
    if (i==3) {
      message = {
       
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0,
            data:{
              "command": "3",
              "name1": collector[uid][1]['name'],
               "lang1": collector[uid][1]['lang'],
               "exp1": collector[uid][1]['exp'],
               "state1": collector[uid][1]['state'],
               "rating1": collector[uid][1]['rating'],
               "iurl1": collector[uid][1]['turl'],
               "sid1": collector[uid][1]['uid'],
               "uidt1": collector[uid][1]['uidt'],
    
                "name2": collector[uid][2]['name'],
                "lang2": collector[uid][2]['lang'],
                "exp2": collector[uid][2]['exp'],
                "state2": collector[uid][2]['state'],
                "rating2": collector[uid][2]['rating'],
                "iurl2": collector[uid][2]['turl'],
                "sid2": collector[uid][2]['uid'],
                "uidt2": collector[uid][2]['uidt'],
             
               "name3": collector[uid][3]['name'],
                "lang3": collector[uid][3]['lang'],
                "exp3": collector[uid][3]['exp'],
                "state3": collector[uid][3]['state'],
                "rating3": collector[uid][3]['rating'],
                "iurl3": collector[uid][3]['turl'],
                "sid3": collector[uid][3]['uid'],
                "uidt3": collector[uid][3]['uidt']
             
           },
        },
        webpush: {
          headers: {
            TTL:"0",
        },
        data:{
          "command": "3",
          "name1": collector[uid][1]['name'],
           "lang1": collector[uid][1]['lang'],
           "exp1": collector[uid][1]['exp'],
           "state1": collector[uid][1]['state'],
           "rating1": collector[uid][1]['rating'],
           "iurl1": collector[uid][1]['turl'],
           "sid1": collector[uid][1]['uid'],
           "uidt1": collector[uid][1]['uidt'],

            "name2": collector[uid][2]['name'],
            "lang2": collector[uid][2]['lang'],
            "exp2": collector[uid][2]['exp'],
            "state2": collector[uid][2]['state'],
            "rating2": collector[uid][2]['rating'],
            "iurl2": collector[uid][2]['turl'],
            "sid2": collector[uid][2]['uid'],
            "uidt2": collector[uid][2]['uidt'],
         
           "name3": collector[uid][3]['name'],
            "lang3": collector[uid][3]['lang'],
            "exp3": collector[uid][3]['exp'],
            "state3": collector[uid][3]['state'],
            "rating3": collector[uid][3]['rating'],
            "iurl3": collector[uid][3]['turl'],
            "sid3": collector[uid][3]['uid'],
            "uidt3": collector[uid][3]['uidt']
         
       },
      },
      token: token
     }; 
    }
    if (i==2) {
      message = {
        
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0,
            data:{
              "command": "2",
              //test collector
               "name1": collector[uid][1]['name'],
               "lang1": collector[uid][1]['lang'],
               "exp1": collector[uid][1]['exp'],
               "state1": collector[uid][1]['state'],
               "rating1": collector[uid][1]['rating'],
               "iurl1": collector[uid][1]['turl'],
               "sid1": collector[uid][1]['uid'],
               "uidt1": collector[uid][1]['uidt'],
    
                "name2": collector[uid][2]['name'],
                "lang2": collector[uid][2]['lang'],
                "exp2": collector[uid][2]['exp'],
                "state2": collector[uid][2]['state'],
                "rating2": collector[uid][2]['rating'],
                "iurl2": collector[uid][2]['turl'],
                "sid2": collector[uid][2]['uid'],
                "uidt2": collector[uid][2]['uidt']
             
           },
        },
        webpush: {
          data:{
            "command": "2",
            //test collector
             "name1": collector[uid][1]['name'],
             "lang1": collector[uid][1]['lang'],
             "exp1": collector[uid][1]['exp'],
             "state1": collector[uid][1]['state'],
             "rating1": collector[uid][1]['rating'],
             "iurl1": collector[uid][1]['turl'],
             "sid1": collector[uid][1]['uid'],
             "uidt1": collector[uid][1]['uidt'],
  
              "name2": collector[uid][2]['name'],
              "lang2": collector[uid][2]['lang'],
              "exp2": collector[uid][2]['exp'],
              "state2": collector[uid][2]['state'],
              "rating2": collector[uid][2]['rating'],
              "iurl2": collector[uid][2]['turl'],
              "sid2": collector[uid][2]['uid'],
              "uidt2": collector[uid][2]['uidt']
           
         },
          headers: {
            TTL:"0",
        },
      },
      token: token
     }; 
    }
    if (i==1) {
      message = {
       
        notification: {
           title: 'Match Found',
             body: 'Connect Now found 3 Tutors!'
         },
          android: {
            ttl: 0, 
            data:{
              "command": "1",
                "name1": collector[uid][1]['name'],
                "lang1": collector[uid][1]['lang'],
                "exp1": collector[uid][1]['exp'],
                "state1": collector[uid][1]['state'],
                "rating1": collector[uid][1]['rating'],
                "iurl1": collector[uid][1]['turl'],
                "sid1": collector[uid][1]['uid'],
                "uidt1": collector[uid][1]['uidt']
             },
        },
        webpush: {
          headers: {
            TTL:"0",
            
        },
        data:{
          "command": "1",
            "name1": collector[uid][1]['name'],
            "lang1": collector[uid][1]['lang'],
            "exp1": collector[uid][1]['exp'],
            "state1": collector[uid][1]['state'],
            "rating1": collector[uid][1]['rating'],
            "iurl1": collector[uid][1]['turl'],
            "sid1": collector[uid][1]['uid'],
            "uidt1": collector[uid][1]['uidt']
         },
      },
      token: token
     }; 
    }
  }
  
    // send tutor
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"sendfcms final message: ",message)
   defaultApp.messaging().send(message)
  .then((response) => {
   // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);})
    .catch((error) => {
       console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending messaget:', error);
      });
  
}
  function activate_student(session_id){
    var message = {
      notification: {
          title: 'Get your doubt solved!',
          body: 'We have tutors online now get your doubts solved!'
        },
        android: {
          ttl: 0,
        
          },
        webpush: {
        fcm_options: {
          "link": "https://webapp.doubtconnect.in/tutor"}
      },
      
      token: collector[session_id][0]["uidstudent"] //testing purpose change to // tokens: a // for more clients upto 500
     };
     defaultApp.messaging().send(message)
  .then((response) => {
   // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);})
    .catch((error) => {
       console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
      });
  }
  function activate_tutor(session_id){
    list=[]
    var subject = collector[session_id][0]["subject"];
    var grade = collector[session_id][0]["grade"];
    var lang = collector[session_id][0]["lang"];
    var board = collector[session_id][0]["board"];
    var chapter = collector[session_id][0]["chpater"];
    var topic = collector[session_id][0]["topic"];
    db.ref("Users1").orderByChild("status").equalTo("offline").once("value", function(snapshot) {
      snapshot.forEach(function(data) {
        var subjects = data.val().Subject;
        let sub = subjects.split(" ");
        if(sub.includes(subject) && data.val().class == grade && data.val().lang == lang && data.val().board == board){ 
          var tag = data.val().tags;
          let tagss = tag.split(" ");
    
          for(i in tagss){
            if(tagss[i] == chapter || tagss[i] == topic){
            
              if(!list.includes(uidash.get(data.key))){
                list.push(uidash.get(data.key));
              
              break;
              }
            }
          }
        }
      });
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',list);
    })
    var message = {
      notification: {
          title: 'Doubts waiting for you!',
          body: 'Hey this might be a good time to come online'
        },
        android: {
          ttl: 0,
          data:{
            command: "online?"
          },
          },
        webpush: {
        fcm_options: {
          "link": "https://webapp.doubtconnect.in/tutor"}
      },
      
      token: list //testing purpose change to // tokens: a // for more clients upto 500
     };
  
// Send a message to the device corresponding to the provided
// registration token.
if(list.length!=0){
  otherApp.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
  })
  .catch((error) => {
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
  });}
}
function sendreject(reject){
  //console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',a[0],"jj")
      //res.send("wait sending to all");
     
      var message = {
          android: {
            ttl: 0,
            data:{
              "response": "REJECT",
              
            },
            },
          webpush: {
            data:{
              "response": "REJECT",
            }
        },
        
        token: reject[0] //testing purpose change to // tokens: a // for more clients upto 500
       };

       var message1 = {
        android: {
          ttl: 0,
          data:{
            "response": "REJECT",
            
          },
          },
        webpush: {
          data:{
            "response": "REJECT",
          }
      },
      
      tokens: reject //testing purpose change to // tokens: a // for more clients upto 500
     };
    
  // Send a message to the device corresponding to the provided
  // registration token.
  if(reject.length==1){
    otherApp.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message-reject:', error);
    });
  }
  else{
    otherApp.messaging().sendMulticast(message1)
    .then((response) => {
      // Response is a message ID string.
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message-reject:', error);
    });
  }
  
}
  function sendfcmtexpired(a,image_url,subject,grade,session_id,lang,board,chapter,topic,phase,uidstudent){
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',a[0],"jj1exp")
      //res.send("wait sending to all");
      
      var message = {
        data:{
          "response": "newr",
          "uid": session_id,
          "image-url": image_url,
          "subject": subject,
          "grade": grade,
          "type": "instant",
          "expired": "YES",
          "chapter": chapter,
          "topic": topic,
          "lang": lang,
          "board": board
        },
        notification: {
            title: 'New doubt',
            body: 'Click to View doubt'
          },
          android: {
            ttl: 0,
            notification: {
              image: image_url
            }
            },
          webpush: {
            headers: {
              image: image_url
          },
          fcm_options: {
            "link": "https://webapp.doubtconnect.in/tutor"},
        },
        
        token: a[0] //testing purpose change to // tokens: a // for more clients upto 500
       };

       var message1 = {
        data:{
          "response": "newr",
          "uid": session_id,
          "image-url": image_url,
          "subject": subject,
          "grade": grade,
          "type": "instant",
          "expired": "YES",
          "chapter": chapter,
          "topic": topic,
          "lang": lang,
          "board": board
        },
        notification: {
            title: 'New doubt',
            body: 'Click to View doubt'
          },
          android: {
            ttl: 0,
            notification: {
              image: image_url
            }
            },
          webpush: {
            headers: {
              image: image_url
          },
          fcm_options: {
            "link": "https://webapp.doubtconnect.in/tutor"},
        },
        
        tokens: a //testing purpose change to // tokens: a // for more clients upto 500
       };
    
  // Send a message to the device corresponding to the provided
  // registration token.
  if(a.length==1){
    otherApp.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
    });
  }
  else{
    otherApp.messaging().sendMulticast(message1)
    .then((response) => {
      // Response is a message ID string.
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:', response);
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
    });
  }
  }
  app.post('/doubt-expired',function(req,res){
    j = collector[req.body.uid]
    [0]["acrc"]
   reject = [];
   for (let i = 1; i <=j; i++) {
     reject.push(uidash.get(collector[req.body.uid][i]["uidt"]))
   }
   console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"rejected tutors timeout: ",reject)
   res.send("teachers sent back.")
   if(reject.length!=0)
   sendreject(reject)
  })
  app.post('/sendfcm-finalr', function (req, res) {
    res.send('wait sending ressponse'); //add subject and grade
   // request.set(req.body.id,req.body.tokens)
    
   var token_final = uidash.get(req.body.uidt);

   j = collector[req.body.uid][0]["acrc"]
   reject = [];
   for (let i = 1; i <=j; i++) {
     if(collector[req.body.uid][i]["uidt"]!=req.body.uidt)
     reject.push(uidash.get(collector[req.body.uid][i]["uidt"]))
   }
   console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"kishan",reject)
   if(reject.length!=0)
   sendreject(reject)

  var message = {
      notification: {
          title: 'Request Accepted',
          body: 'Moving you to the live session'
        },
        android: {
          ttl: 0,
          data:{
              "response": "accepted"   //t1 session-name
          },
          },
        webpush: {
        data:{
          "response": "accepted"
        },
      },
      
    token: token_final
  };
  
  otherApp.messaging().send(message)
    .then((response) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message: final', response);
      delete collector[req.body.uid];
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
    });
  })
  app.post('/response-tos', function(req, res) {
    var token_final = request.get(req.body.uid);
    var message = {
      notification: {
          title: 'Accepted response',
          body: 'Response accepted move to the session'
        },
        android: {
          ttl: 0,
          data:{
              "response" : "godspeed"
          },
        },
        webpush: {
          data:{
            "response" : "godspeed"
          },
        },
    token: token_final
  };
  console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',token_final)
  // Send a message to the device corresponding to the provided
  // registration token.
  defaultApp.messaging().send(message)
    .then((response) => {
      res.send("connection request send to student")
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Successfully sent message:response', response);
    })
    .catch((error) => {
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -','Error sending message:', error);
    });
  });

  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(3001);
//app.listen(3001);

let f=[];
function student(uidsession){
  var uid = collector[uidsession][0]["uidstudent"]
  var path = `Sessions/Solved/${uid}`;   //add solved
  var key = uidsession;
  let l = [];
  for (let i = 1; i <=collector[uidsession][0]["acrc"]; i++) 
    l.push(collector[key][i]['uidt'])  
  f=[];
  sdb.ref(path).orderByChild("rating").once("value", function(snapshot){
      snapshot.forEach(function(data){
          if(data.val().rating > 4.5){
              if(!f.includes(data.val().uidtutor))
               f.push(data.val().uidtutor)
              
            }
            else if(data.val().rating < 3.6){
              console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"rating < 3.6 ")
              if(l.includes(data.val().uidtutor))
              console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"index : ",l.indexOf(data.val().uidtutor)+1)
              //will not work until splice is above delete
              l.splice(l.indexOf(data.val().uidtutor), 1)
              if(collector[key][l.indexOf(data.val().uidtutor)+1]['uidt']==data.val().uidtutor)
                {collector[uidsession][0]["acrc"]-=1
                delete collector[key][l.indexOf(data.val().uidtutor)+1];}
             }
          
    })
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',collector[key])
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"l= ",l);
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"f= ",f);
    sorting(uidsession);
})
}
function sorting(uid){
    if(f.length < 3){
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"f.length < 3");
        quicksort(collector[uid], 1, collector[uid][0]["acrc"]);
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"sorted1: ",collector[uid]);
  
      if (f.length==1) {
        console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"f.length=1");
        if(!f.includes(collector[uid][1]['uidt']))
        f.push(collector[uid][1]['uidt']);
        if(f.length<2){
          console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"first tutor selected=")
          f.push(collector[uid][2]['uidt']);
        }
      }
      else if (f.length==0) {
        console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"f.length=0");
        f.push(collector[uid][1]['uidt']);
        if(collector[uid][2]['rating'] == collector[uid][3]['rating']){
            if(collector[uid][2]['exp'] >= collector[uid][3]['exp'])
            if(!f.includes(collector[uid][2]['uidt']))
                f.push(collector[uid][2]['uidt']);
            else 
            if(!f.includes(collector[uid][3]['uidt'])) 
              f.push(collector[uid][3]['uidt']);
        }
        else if (collector[uid][2]['rating'] > collector[uid][3]['rating']){
          f.push(collector[uid][2]['uidt']);
        }
        else if(collector[uid][2]['rating'] < collector[uid][3]['rating']){
          f.push(collector[uid][3]['uidt']);
        }
      }
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"last ele: ",collector[uid][collector[uid][0]["acrc"]]['uidt'])
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"last ele f includes:  ",f.includes(collector[uid][collector[uid][0]["acrc"]]['uidt']))
      if(!f.includes(collector[uid][collector[uid][0]["acrc"]]['uidt']))
      f.push(collector[uid][collector[uid][0]["acrc"]]['uidt'])
  
      console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"final output f = ",f);

    }
    sendfcms_mix(request.get(uid),uid,f.length,2,f)
    //delete collector[uid];
  }
  function quicksort(a, l, h){

    if(l<h){
        p = partition(a, l, h);
  
        quicksort(a, l, p-1);
        quicksort(a, p+1, h);
    }
    console.log ( '[' + new Date().toISOString().substring(11,23) + '] -',"sorted2: ");
  }
  
  function partition(arr, low, high){
  
  pivot = arr[high];
  
  i = low-1;
  
  for(let j=low; j< high; j++){
  
    if(arr[j].rating > pivot.rating){
        i++;
        swap(arr, i, j);
       
    }
        
  }
  
  swap(arr, i+1, high);
  return i+1;
  
  }
  
  function swap(a, m, n){
    var t ;
    t =a[m];
    a[m] = a[n];
    a[n] = t;
  }	
