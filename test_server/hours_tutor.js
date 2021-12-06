var dateFormat = require("dateformat");

const intervalTime = 1000;
setInterval(function() {
    // This will be executed every intervalTime milliseconds
  //Sat Jun 19 2021 18:04:25
var now = dateFormat();
var todayDate = now[8] + now[9];
console.log(todayDate)
if (todayDate === "01")
{
    console.log(true)
}
else
{
    console.log(false)
}
}, intervalTime);


//// after 24hrs remove all expired sessions 