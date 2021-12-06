// var admin = require('firebase-admin');
// var otherAppConfig = {credential: admin.credential.cert(require("./service_acc_2.json")), databaseURL: "https://doubtconnect-teachers.firebaseio.com/"}
// var otherApp = admin.initializeApp(otherAppConfig, 'other');
// var db = otherApp.database();
// const reff = db.ref('Tags/');
var final = [];
var list =[];



//---------------------- //input - teacher signup -------------//
//leQnxUXVzLhEXbwHb27RhUVfK0m1
// var uid = "leQnxUXVzLhEXbwHb27RhUVfK0m1"
// var s = "cbse-12-physics,cbse-12-physics-1.2 refraction,12-physics,cbse-12-physics-3.Light"


// s = s.replace(/[.]/g,'')

// //console.log(s);
// var tokens = s.split(",")
// tokens.forEach(function(value){
//     console.log(value);
//     reff.child(value).push(uid)
//   });

//---------------------- Request from student -------------//
// var request = "cbse-12-physics-1.2 refraction".replace(/[.]/g,'')
// db.ref("Users1").orderByChild("status").equalTo("online").once("value", function(snapshot) {
    
//     snapshot.forEach(function(data) {
//         console.log(data.key)
//         list.push(data.key)
//     })
// });
// db.ref("Tags").child(request).once("value", function(snapshot) {
    
//     snapshot.forEach(function(data) {
//         console.log(data.val())
//         if(list.includes(data.val()))
//         {
//             final.push(data.val())
//         }
//     })
//     console.log(final)
// });
let key = "instant1ik5e4tlkqqixy0i"
 var colector = {
    instant1ik5e4tlkqqixy0i: [
      {
        acrc: 2,
        phase: 'two',
        rf: 'no',
        rsend: [Array],
        uidstudent: 'EZx8cT2LxBZx2wc7SgDac396iq73',
        image_url: 'https://firebasestorage.googleapis.com/v0/b/doubtconnect-a1cf3.appspot.com/o/doubts%2F578f316e-d452-40dd-8318-082a4614e78f?alt=media&token=c3fc8b28-83ad-4293-9293-efed3b0215fd',
        subject: 'Physics',
        grade: '11th',
        session_id: 'instant1ik5e4tlkqqixy0i',
        lang: 'English',
        slang: ' Bengali Gujarati Hindi ',
        board: 'CBSE',
        chapter: '1. Physical World',
        topic: '1.4 Fundamental Forces In Nature'
      },
      {
        uid: 'instant1ik5e4tlkqqixy0i',
        accept: '1',
        uidt: 'eY2LzVVFxrSBfMDdeXbtDTXC6WQ2',
        exp: '1 years',
        name: 'Kishan',
        rating: '2',
        state: 'Andaman and Nicobar Islands',
        lang: 'English',
        phase: 'two',
        topic: '1.4 Fundamental Forces In Nature',
        chapter: '1. Physical World',
        subject: 'Physics',
        grade: '11th',
        turl: 'https://firebasestorage.googleapis.com/v0/b/doubtconnect-teachers.appspot.com/o/images%2F411783fa-9d08-4ce9-8d3a-382463853cc3?alt=media&token=536e4753-a9a3-44f0-bc6a-2da64eb2b74a'
      },
      {
        uid: 'instant1ik5e4tlkqqixy0i',
        accept: '1',
        uidt: 'eY2LzVVFxrSBfMDdeXbtDTXC6WQ24',
        exp: '1 years',
        name: 'Kishan',
        rating: '2',
        state: 'Andaman and Nicobar Islands',
        lang: 'English',
        phase: 'two',
        topic: '1.4 Fundamental Forces In Nature',
        chapter: '1. Physical World',
        subject: 'Physics',
        grade: '11th',
        turl: 'https://firebasestorage.googleapis.com/v0/b/doubtconnect-teachers.appspot.com/o/images%2F411783fa-9d08-4ce9-8d3a-382463853cc3?alt=media&token=536e4753-a9a3-44f0-bc6a-2da64eb2b74a'
      }
    ]
  }
  let i =1;
  let k = []
  let oi=[]
  k.push("eY2LzVVFxrSBfMDdeXbtDTXC6WQ2")
  k.push("eY2LzVVFxrSBfMDdeXbtDTXC6WQ24")
  for (let j = 1; j <=colector[key][0]["acrc"]; j++) 
  {if(k.includes(colector[key][j]['uidt']))
  oi.push(j)
  }
  delete colector[key][1]
  colector[key].filter()
  console.log(colector[key].filter(function (el) {
    return el != null;
  }))
  colector[key][1]=""
  //console.log(colector[key])


  //copy data

  