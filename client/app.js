angular.module('coinsaver', ['ngMaterial', 'firebase', 'ngCookies', 'ui.router'])
.config(($mdThemingProvider) => {
  $mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('light-green', {
      default: '400', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100', // use shade A100 for the <code>md-hue-3</code> class
    })
  // If you specify less than all of the keys, it will inherit from the
  // default shades
    .accentPalette('green', {
      default: '200', // use shade 200 for default, and keep all other shades the same
    });
})
.config(($stateProvider) => {
  const homeState = {
    name: 'home',
    url: '/',
    template: '<home />',
  };
  const statsState = {
    name: 'stats',
    url: '/stats',
    template: '<stats />',
  };
  const banksState = {
    name: 'banks',
    url: '/banks',
    template: '<banks />',
  };
  const accountState = {
    name: 'account',
    url: '/account/:myParam',
    template: '<account />',
    controller: function ($stateParams) {
      // console.log($stateParams)
    }
  };
  const settingsState = {
    name: 'settings',
    url: '/settings',
    template: '<settings />',
  };
  $stateProvider.state(homeState);
  $stateProvider.state(statsState);
  $stateProvider.state(banksState);
  $stateProvider.state(accountState);
  $stateProvider.state(settingsState);
})
.component('myApp', {
  controller($http, $cookies, $firebaseObject, Auth, User) {
    const ctrl = this;

    this.loggedIn = false;
    this.user = {};

    this.view = 'home';

    this.testFunc = function () {
      console.log('The test func has been clicked,');
      // console.log('The current user data is; ');
      // console.log(ctrl.user);
      console.log('Auth options are: ', Auth)
      console.log('Current auth is: ', Auth.$getAuth())
    };

    this.logOut = function () {
      this.loggedIn = false;
      this.user = {};
      $cookies.remove('coinsaveruser');
      Auth.$signOut();
      User.set({})
      location.reload()
    };

    this.login = function (){
        // logwin.showProgress = true;
        Auth.$signInWithPopup('google')
          .then((result) => {
            console.log(`Signed into google as: ${result.user.displayName}`);
            ctrl.user.firebaseId = result.user.uid;
            ctrl.user.accountInfo = result.user;
            ctrl.user.displayName = result.user.displayName;
            ctrl.loggedIn = true;
            ctrl.checkfbUser();
          })
    }

    // ------------------
    // BEGIN FIREBASE
    // ------------------
    
    this.checkfbUser = () => {

      console.log('checking if this user exists...')

      var ref = firebase.database().ref('users/' + Auth.$getAuth().uid + '/userinfo');

      ref.once("value", snapshot => {
        const user = snapshot.val();
        if (user){
          console.log('THIS USER ALREADY EXISTS, it is:', snapshot.val());
        } else {
          ctrl.writefbUser('works','true')
        }
      })

    }

    this.writefbUser = function (property, value) {
      
      var currentuser = Auth.$getAuth()

      console.log('writing a new user for you now, ')
      console.log('here are your items to strip off of: ', currentuser )

      var ref = firebase.database().ref('users/' + Auth.$getAuth().uid + '/userinfo');
      var obj = {};

      obj[property] = value;
      obj.name = currentuser.displayName;
      obj.email = '';
      obj.signupdate = '';
      obj.name = 

      ref.set(obj)

      ref.on('value', function(snapshot){
        console.log('the new profile is: ', snapshot.val())
        }, function (errorObject){
        console.log('read failed: ', errorObject)
      })
      
    } 

    // ------------------
    // END FIREBASE
    // ------------------

    this.$onInit = () => {

      Auth.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
          console.log("Signed in as:", firebaseUser.uid);
          let tempUser = firebaseUser;
          User.set(tempUser)
          console.log('factory user is: ', User.get())
          ctrl.user = firebaseUser;
          ctrl.loggedIn = true;
        } else {
          console.log("Signed out");
        }
      });

    };
  },

  template:
  `
  <!-- Nav Bar -->
  <md-content layout="column" flex>
    <md-nav-bar md-selected-nav-item="$ctrl.currentNavItem" nav-bar-aria-label="navigation links">
      <md-nav-item  ui-sref="home" ui-sref-active="home" md-nav-click="$ctrl.view='home'" name="home">
        Home
      </md-nav-item>
      <md-nav-item ui-sref="stats" ui-sref-active="stats" md-nav-click="$ctrl.view='stats'" name="stats">
        Stats
      </md-nav-item>
      <md-nav-item ui-sref="banks" ui-sref-active="banks" md-nav-click="$ctrl.view='banks'" name="banks">
        Banks
      </md-nav-item>
      <md-nav-item ui-sref="account({myParam: 'home'})" ui-sref-active="account" md-nav-click="$ctrl.view='account'" name="account">
        Wallet
      </md-nav-item>
      <md-nav-item ui-sref="settings" ui-sref-active="settings" md-nav-click="$ctrl.view='account'" name="settings">
        Account Settings
      </md-nav-item>

      <!-- Spacer -->
      <span class="fill-space"></span>

      <!-- Login / Welcome -->
      <div ng-if="$ctrl.loggedIn === false">
        <md-nav-item md-nav-click="$ctrl.login('google')" name="login">
          [ Login ]
        </md-nav-item>
      </div>

      <div ng-if="$ctrl.loggedIn === true">
        <md-button>
        Welcome, {{$ctrl.user.displayName}}
        </md-button>
        <md-button ng-click="$ctrl.logOut()" name="logout">
        [ Log out ]
        </md-button>
      </div>

    </md-nav-bar>

  <!-- Ui Router Body -->
    <ui-view></ui-view>

  </md-content>
`,
});