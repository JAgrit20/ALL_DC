let uidash = new Map();
var request = new Map();
var list =[];
var collector={};var or=0;
var uniqid = require('uniqid');
var express = require('express');
var app = express()
app.use(express.json());
var config = require('./config.json');
const crypto = require('crypto');
var admin = require('firebase-admin');
var defaultAppConfig = {credential: admin.credential.applicationDefault(), databaseURL: "https://doubtconnect-a1cf3.firebaseio.com/"}
var defaultApp = admin.initializeApp(defaultAppConfig,'default');
var otherAppConfig = {credential: admin.credential.cert(require("/var/www/service_acc_2.json")), databaseURL: "https://doubtconnect-teachers.firebaseio.com/"}
var otherApp = admin.initializeApp(otherAppConfig, 'other');
var db = otherApp.database();
var sdb = defaultApp.database()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(request, response){
  response.send("Welcome To the DC SEVER! --HK")
});
app.post('/updatentoken', function(request, response){
 // response.header("Access-Control-Allow-Origin", "*");
  if(uidash.get(request.body.uid)== undefined | uidash.get(request.body.uid)!=request.body.token){
  uidash.set(request.body.uid,request.body.token);
  console.log(uidash)
  response.json({ token: 'updated' });   // echo the result back
  }
});
app.post('/orderid-i', function(request, response){
  response.send(uniqid('Order'))
});
app.post('/payment-i', function(request, response){
  var data = request.body
  var signature = request.body.signature
  var secretKey =  config.secretKey
  console.log(secretKey)
  signatureData = "";
  signatureData = data["orderId"] + data["orderAmount"] + data["referenceId"] + 
                  data["txStatus"] + data["paymentMode"] + data["txMsg"] + data["txTime"];
  var derivedSignature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
  console.log(derivedSignature)
  if(derivedSignature !== signature){
     response.send("there was a missmatch in signatures genereated and received")
     console.log("not-success")
  }
  else
  {
      response.send("payment success")
      console.log("success")
  }
})
app.post('/sendfcm-i', function(req, res) {
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
  console.log(req.body)
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
      collector[session_id][0]["slang"]=req.body.slang;
      collector[session_id][0]["slang"]=req.body.lang;  // secondary lang
      collector[session_id][0]["board"]=req.body.board;
      collector[session_id][0]["chapter"]=req.body.chapter;
      collector[session_id][0]["topic"]=req.body.topic;
      or++;
  db.ref("Users1").orderByChild("status").equalTo("online").once("value", function(snapshot) {
    snapshot.forEach(function(data) {
      var subjects = data.val().Subject;
      let sub = subjects.split(" "); //cahnge Board
      //console.log("tags","as")
      if(sub.includes(subject) && data.val().class == grade && data.val().lang == lang && data.val().board == board){ 
        var tag = data.val().tags;
        let tagss = tag.split(",");
       // console.log("tags",tagss)
        for(i in tagss){
          if(tagss[i] == chapter || tagss[i] == topic){
            //if(!list.includes(data.key))  
            if(!list.includes(uidash.get(data.key))){
              list.push(uidash.get(data.key));
              collector[session_id][0]["rsend"].push(data.key);
            break;
            }
          }
        }
      }
    });
    console.log(list,"koioio");
    if(list.length!=0){
      sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"one",uidstudent);
    }
    res.send(session_id)
    // else{
    //   res.send("no1")
    // }
    
  });
});

// ********************************** response **************************//
app.post('/response-i', function(req, res) {
  // name,lang,exp,state,city,rating,uid,nds(no. of doubts solved)
  //create a list
  console.log(req.body);
    collector[req.body.uid][0]["acrc"]+=1;
    collector[req.body.uid].push(req.body);
     //think2
    console.log(collector);console.log(or);
    res.send("res recorded wait 90sec")
  });
  // ********************************** response PHASE-N(1,2,3,4) **************************//
  app.post('/response-i1', function(req, res){
    console.log(req.body)
    //need pr of doubt_image,subject,grade,sid,lang,chaoter,topic
    if(collector[req.body.uid][0]["rf"]!="yes")    //rf -request finished 
  {
    collector[req.body.uid][0]["rf"]=="yes"
    var image_url = collector[req.body.uid][0]["image_url"];
    var subject = collector[req.body.uid][0]["subject"];
    var grade = collector[req.body.uid][0]["grade"];
    var session_id = collector[req.body.uid][0]["session_id"];
    var lang = collector[req.body.uid][0]["lang"];
    var board = collector[req.body.uid][0]["board"];
    var chapter = collector[req.body.uid][0]["chpater"];
    var topic = collector[req.body.uid][0]["topic"];
    var slang = collector[req.body.uid][0]["slang"];
    list = [];
    if(collector[req.body.uid][0]["acrc"]==3){
      res.send("done")
      delete collector[req.body.uid];or--;  //delete request t1 - send request to all the tutors for expiry
      var token_final = request.get(req.body.sname);
      sendfcms(token_final,req.body.uid,collector[req.body.uid][0]["acrc"],1)
      sendfcmtexpired(list,image_url,subject,grade,session_id,lang,board,chapter,topic,collector[req.body.uid][0]["phase"]);
    }
  else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'two')){
    // drop tags 
    res.send("again")
    collector[req.body.uid][0]["rf"]=="no"
    db.ref("Users1").orderByChild("status").equalTo("online").on("value", function(snapshot) {
        snapshot.forEach(function(data) {
          var subjects = data.val().Subject;
            let sub = subjects.split(" ");
        
            if(sub.includes(subject) && data.val().class == grade && data.val().lang == lang){ 
              if((!list.includes(uidash.get(data.key)))&&
              (!collector[req.body.uid][0]["rsend"].includes(data.key))){
                list.push(uidash.get(data.key));
                collector[req.body.uid][0]["rsend"].push(data.key);
              }
          }  
        });
        collector[req.body.uid][0]["phase"]="three";
        if(list.length)
        sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"three");
    });
}
  else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'one')){
    // drop board 
    res.send("again")
    collector[req.body.uid][0]["rf"]=="no"
        db.ref("Users").orderByChild("status").equalTo("online").once("value", function(snapshot) {
             snapshot.forEach(function(data) {
              var subjects = data.val().Subject;
              let sub = subjects.split(" ");
              if(sub.includes(subject) && data.val().class == grade && ((data.val().lang == lang)||(data.val().slang.split(" ").includes(slang)))){ 
                var tag = data.val().tags;
                let tagss = tag.split(" ");
        
                for(i in tagss){
                  if(tagss[i] == chapter || tagss[i] == topic){
                    if((!list.includes(uidash.get(data.key)))&&
              (!collector[req.body.uid][0]["rsend"].includes(data.key))){
                list.push(uidash.get(data.key));
                collector[req.body.uid][0]["rsend"].push(data.key);break;
              }
                    
                    
                  }
                }
                           
              }
            });
            collector[req.body.uid][0]["phase"]="two";
            if(list.length)
            sendfcmt(list,image_url,subject,grade,session_id,lang,board,chapter,topic,"two");
    
        });
      }
      else if((collector[req.body.uid][0]["acrc"]<3)&&(collector[req.body.uid][0]["phase"] == 'three')){
        // drop board 
        if(collector[req.body.uid][0]["acrc"]==0){
          res.send("no1")
          activate_tutor(req.body.uid)
        }
        else{
          res.send("done15")
          sendfcms(request.get(req.body.uid),req.body.uid,collector[req.body.uid][0]["acrc"],0) //show what we got
        }
        }
      else{
        res.send("done")
        student(req.body.uid)
      }
    }
  });
  app.post('/response-ilate', function(req, res) {  //for tutor coming online
    
    console.log(req.body);
      if(collector[req.body.uid]){
        collector[req.body.uid][0]["acrc"]+=1;
       //think2
      console.log(collector);console.log(or);
      res.send("res recorded wait 90sec")
      if (collector[req.body.uid][0]["acrc"]==3) {
        activate_student(req.body.uid)
        delete collector[req.body.uid];or--; }
      }
    });
function sendfcmt(a,image_url,subject,grade,session_id,lang,board,chapter,topic,phase,uidstudent){
  console.log(a[0],"jj")
    //res.send("wait sending to all");
    var message = {
      notification: {
          title: 'New doubt',
          body: 'Click to View doubt'
        },
        data:{
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
        android: {
          ttl: 0,
          notification: {
            image: image_url
          }
          },
        webpush: {
          headers: {
            TTL:"0",
            image: image_url
        },
        fcm_options: {
          "link": "http://localhost:3000/tutor"},
        
      },
      
      token: a[0] //testing purpose change to // tokens: a // for more clients upto 500
     };
  
// Send a message to the device corresponding to the provided
// registration token.
//console.log(message)
otherApp.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}
  function sendfcms(token,uid,i,type)  //t1 sort acc type 
  {
    var message ;
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
            "tutor3":{
              "name3": collector[uid][3]['name'],
               "lang3": collector[uid][3]['lang'],
               "exp3": collector[uid][3]['exp'],
               "state": collector[uid][3]['state'],
               "rating": collector[uid][3]['rating'],
               "iurl": collector[uid][3]['turl'],
               "sid": collector[uid][3]['uid'],
               "uidt": collector[uid][3]['uidt']
            }
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
            }
        },
      token: token
     }; 
    }
    // send tutor
   defaultApp.messaging().send(message)
  .then((response) => {
   // Response is a message ID string.
    console.log('Successfully sent message:', response);})
    .catch((error) => {
       console.log('Error sending message:', error);
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
          "link": "http://localhost:3000/tutor"}
      },
      
      token: collector[session_id][0]["uidstudent"] //testing purpose change to // tokens: a // for more clients upto 500
     };
     defaultApp.messaging().send(message)
  .then((response) => {
   // Response is a message ID string.
    console.log('Successfully sent message:', response);})
    .catch((error) => {
       console.log('Error sending message:', error);
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
      console.log(list);
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
          "link": "http://localhost:3000/tutor"}
      },
      
      token: list //testing purpose change to // tokens: a // for more clients upto 500
     };
  
// Send a message to the device corresponding to the provided
// registration token.
otherApp.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
  }
  function sendfcmtexpired(a,image_url,subject,grade,session_id,lang,board,chapter,topic,phase,uidstudent){
    console.log(a[0],"jj")
      //res.send("wait sending to all");
      var message = {
        notification: {
            title: 'New doubt',
            body: 'Click to View doubt'
          },
          android: {
            ttl: 0,
            data:{
                "uid": session_id,
                "image-url": image_url,
                "subject": subject,
                "grade": grade,
                "type": "instant",
                "expired": "YES",
                "chapter": chapter,
                "topic": topic,
                "lang": lang,
                "board": board,
                "phase": phase,
                "uidstudent": uidstudent
            },
            notification: {
              image: image_url
            }
            },
          webpush: {
            headers: {
              image: image_url
          },
          fcm_options: {
            "link": "http://localhost:3000/tutor"},
          data:{
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
        },
        
        token: a[0] //testing purpose change to // tokens: a // for more clients upto 500
       };
    
  // Send a message to the device corresponding to the provided
  // registration token.
  otherApp.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
  }
  app.post('/sendfcm-finalr', function (req, res) {
    res.send('wait sending ressponse'); //add subject and grade
   // request.set(req.body.id,req.body.tokens)
    
   var token_final = uidash.get(req.body.uidt);

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
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
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
  console.log(token_final)
  // Send a message to the device corresponding to the provided
  // registration token.
  defaultApp.messaging().send(message)
    .then((response) => {
      res.send("connection request send to student")
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
  });

app.listen(3001);

let f=[];
function student(uidsession){
  var uid = collector[uidsession][0]["uidstudent"]
  var path = `Sessions/${uid}`;
  let l = [];
  for (let i = 1; i < collector[uidsession][0]["acrc"]; i++) 
    l.push(collector[key][i]['uidt'])  
  f=[];
  sdb.ref(path).orderByChild("rating").once("value", function(snapshot){
      snapshot.forEach(function(data){
          if(data.val().rating > 4.5){
              if(!f.includes(data.val().uidtutor))
               f.push(data.val().uidtutor)
              
            }
            else if(data.val().rating < 3.6){
              if(l.includes(data.val().uidtutor))

                  l.splice(l.indexOf(data.val().uidtutor), 1)
                  
                  if(collector[key][l.indexOf(data.val().uidtutor)+1]['uidt']==data.val().uidtutor)
                    delete collector[key][i];
                  
             }
          
    })
    console.log("l= ",l);
    console.log("f= ",f);
    sorting(uidsession);
})
}
function sorting(uid){
    if(f.length < 3){
        quicksort(collector[uid], 1, collector[uid][0]["acrc"]);
      //console.log(collector[uid]);
  
      if (f.length==1) {
        if(!f.includes(collector[uid][1]['uid']))
        f.push(collector[uid][1]['uid']);
      }
      else if (f.length==0) {
        f.push(collector[uid][1]);
        if(collector[uid][2]['rating'] == collector[uid][3]['rating']){
            if(collector[uid][2]['exp'] >= collector[uid][3]['exp'])
            if(!f.includes(collector[uid][2]['uid']))
                f.push(collector[uid][2]['uid']);
            else 
            if(!f.includes(collector[uid][3]['uid'])) f.push(collector[uid][3]['uid']);
          
        }
      }
      if(!f.includes(collector[uid][collector[uid][0]["acrc"]]['uid']))
      f.push(collector[uid][collector[uid][0]["acrc"]]['uid'])
  
      console.log(f);
    }
    sendfcms(request.get(uid),uid,f.length,2)
  }
  function quicksort(a, l, h){

    if(l<h){
        p = partition(a, l, h);
  
        quicksort(a, l, p-1);
        quicksort(a, p+1, h);
  
  
    }
  
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