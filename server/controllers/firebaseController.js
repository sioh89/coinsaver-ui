const admin = require("firebase-admin");
const serviceAccount = require('../../config/firebaseconfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://coinsaverapp.firebaseio.com"
});

var auth = admin.auth();
var db = admin.database();

//!!This function prints your entire DB of a specific path to the console!!

var printDB = function(path){
  var dbpath = db.ref(path);

  dbpath.once("value", snapshot => {
    const db = snapshot.val();
    if (db){
      console.log('Your current database is: ', db);
    } else {
      // ctrl.writefbUser('works','true')
      console.log('Is your database currently empty? Try linking a google account')
    }
  })  
}

//!!This is an example of printDB in action!!

printDB('/users')

//!!This function updates a single property, below is an example of using it to update my user info's name to huckabee

var updateFB = function(userid, path, property, value){
  var userpath = db.ref('users/' + userid + path)
  // console.log(userpath)

  userpath.update({
    property: value
  });
}

//!!This is an example of updateFB in action!!

// updateFB('bpc2buxD1DTtSWo3zDcrk1oFXY72', '/userinfo', 'name', 'huckabee')


//! This functions returns whether or not there is data/ a file in a specific filepath.

var checkDB = function(userid, path, callback){  
  var dbpath = db.ref('users/' + userid + path);

  dbpath.once("value", snapshot => {
    const db = snapshot.val();
    if (db){
      callback("true")
    } else {
      callback("false")
    }
  })
}




//!!! COINSAVER FUNCTIONS !!!

var saveCoinAuth = function(userid,access_token,refresh_token,scope){
  var userpath = db.ref('users/' + userid + '/coinbaseinfo')

  userpath.update({
    'access_token': access_token,
    'refresh_token': refresh_token,
    'scope': scope,
    'credentials' : 'valid'
  });
}

var coinAuthRefresh = function(userid, callback){
  var userpath = db.ref('users/' + userid + '/coinbaseinfo')
  
  userpath.once("value", snapshot => {
    const refreshToken = snapshot.val().refresh_token;
    if (refreshToken){
      // console.log('the refresh token is: ', refreshToken)
      callback(refreshToken);
    } else {
      // ctrl.writefbUser('works','true')
      console.log('Is your database currently empty? Try linking a google account')
    }
  })
}

module.exports = {updateFB, printDB, checkDB, saveCoinAuth, coinAuthRefresh}