
var admin = require('firebase-admin');
var otherAppConfig = {credential: admin.credential.cert(require("/var/www/service_acc_2.json")), databaseURL: "https://doubtconnect-teachers.firebaseio.com/"}
var otherApp = admin.initializeApp(otherAppConfig, 'other');
var db = otherApp.database();
db.ref("Users").orderByChild("status").equalTo("online").once("value", function(snapshot) {
    snapshot.forEach(function(data) {
        console.log(data.key)
       // db.ref("Users").child(`${data.key}`).child("status").set("offline")
        //online.push(data.key)
    })
});

