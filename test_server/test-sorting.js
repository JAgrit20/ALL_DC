var data = require("./teachers.json");
var admin1 = require('firebase-admin');
const fetch = require('node-fetch');
var admin = require('firebase-admin');
var otherAppConfig = {credential: admin.credential.cert(require("/var/www/service_acc_2.json")), databaseURL: "https://doubtconnect-teachers.firebaseio.com/"}
var otherApp = admin.initializeApp(otherAppConfig, 'other');
var db = otherApp.database();
var looper = data.array; //global declaration

var studentCongig = {credential: admin.credential.cert(require("/var/www/service_acc.json")), databaseURL: "https://doubtconnect-a1cf3.firebaseio.com/"}
var studentApp = admin1.initializeApp(studentCongig, 'other1')
var sdb = studentApp.database()
let l = [];
let l1 = [];
let unrate_list = [];
let rate_list = []

var temp;
var n1 = 0;
var n2 = 0;
var n = 0;
var comparer = 0;


let list = []; //create a list
let final = [];
var main_t = setInterval(function(){

  n++;
    //looper.push(req.body)
    if(n == 10){
      clearInterval(main_t);

      if(looper.length==3){
        console.log(looper);  // send tutor
    }
    else if(looper.length<3){
            // drop board at n1 time
           
           var t1 = setInterval(() => {
           
            n1++;
            console.log(n1);
            console.log("t1")
            //console.log(list.length < 3);
            
            if(list.length < 3){
                db.ref("Users1").orderByChild("status").equalTo("online").on("value", function(snapshot) {
                     snapshot.forEach(function(data) {
                    var subjects = data.val().Subject;
                      let sub = subjects.split(" ");
                      
                  
                      if(sub.includes("Chem") && data.val().class == "10th"){ 
                        var tag = data.val().tags;
                        let tagss = tag.split(" ");
                  
                        for(i in tagss){
                          if(tagss[i] == "English" || tagss[i] == "Chemistry"){  //chapter || topic
                            
                             //list.push(uidash.get(data.key));
                            //console.log(data.val());
                            if(!list.includes(data.key)){
                                list.push(data.key);
                            }
                            
                          }
                        }
                                   
                      }
                    });
        
                });
            }
            else{
                console.log("jj");
                clearInterval(t1);
            }
    
            console.log(list);
            if(n1 == 5){
                clearInterval(t1);
                var t2 = setInterval(function() {
                    n2++;
                    console.log(n2);
                    console.log("bb");
                    if(list.length <3){
                        db.ref("Users1").orderByChild("status").equalTo("online").on("value", function(snapshot) {
                            snapshot.forEach(function(data) {
                              var subjects = data.val().Subject;
                              let sub = subjects.split(" ");
                            
                              if(sub.includes("Physics") && data.val().class == "9th"){ 
                                if(!list.includes(data.key)){
                                    list.push(data.key);
                                }//list.push(uidash.get(data.key));
                              }
                              
                              
                            });
                        });
                    }
                    else{
                        console.log("end");
                        clearInterval(t2);
                    }
        
                    console.log(list);
                    if(n2 == 10){
                        n2 = 0;
                        clearInterval(t2);
                    }
            
                }, 1000);
            }
            
            
        }, 1000);
        
    }
    else{
       
          function first(){
            console.log('first')
          }
          function second(){
            console.log('second')
          }
          let run = async ()=>{
            await new Promise(resolve => setTimeout(() => resolve(student()), 5000));
            await new Promise(resolve => setTimeout(() => resolve(sorting()), 5000));
          }
          run();
        
    }

      
    }
  
 }, 1000)
// time ----- 1 loop

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

    if(arr[j].points > pivot.points){
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
function student(){
    sdb.ref("Sessions").orderByChild("rating").once("value", function(snapshot){
        snapshot.forEach(function(data){
          let a = data.val()
          let b = data.key
          let mapper = new Map()
          let keys = []
          let vals = []
      
          keys.push(data.key)
          vals.push(data.val())
      
          
          //console.log(keys)
          //console.log(vals)
      
          for(i in keys){
            mapper.set(keys[i], vals[i])
          }
      
          //console.log(mapper.values())
          for (let [key, value] of mapper.entries()) {
            for(i in value){
             if(value[i].rating > 4.5){
               if(!l.includes(key))
               {
                l.push(key)
               }
               
             }
             if(value[i].rating < 3.5){
                if(!unrate_list.includes(key))
                {
                 unrate_list.push(key)
                }
                
              }

            }
          }
          
        
        })
        console.log(l);
        rate_list = l;
        console.log(l.length);
        comparer = l.length

      })
      
}

	
function sorting(){
    if(comparer == 3){
        console.log(rate_list);
    }
    else{
        quicksort(looper, 0, looper.length-1);
        //console.log(looper);

        for(j in looper){
            if(looper[j].points >=3.5){
                l1.push(looper[j])
            }
        }

        looper = l1

        console.log(looper)
    
        final.push(looper[0].user);
        if(looper[1].points == looper[2].points){
            if(looper[1].exp >= looper[2].exp){
                final.push(looper[1].user);
            }
            else{
                final.push(looper[2].user);
            }
        }
        final.push(looper[looper.length-1].user)
    
        console.log(final);
    }
}

