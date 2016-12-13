var config = {
	apiKey: "AIzaSyDOCvsfzC_4SI7i3ktXJyb8MO1h3XYRjhU",
	authDomain: "rps-m-7afeb.firebaseapp.com",
	databaseURL: "https://rps-m-7afeb.firebaseio.com",
	storageBucket: "rps-m-7afeb.appspot.com",
	messagingSenderId: "831523599073"
};
firebase.initializeApp(config);

var database = firebase.database()
var auth = firebase.auth()
var uid
var name = prompt('What is your name?')
var yourData
var yourDataRef
var players, player1, player2, snaps

$(document).ready(function() {
	//window.location.replace("http://stackoverflow.com")
	
	firebase.auth().signInAnonymously().catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...
	});
	auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
        } else {
            console.log('No User')
            // User is signed out.
        }
        // ...
	})

	database.ref('.info/connected').on('value', function(snap) {
        if (snap.val()) {
			database.ref('connections').push(true).onDisconnect().remove()
			yourData = database.ref('players').push({
				name:name,
				selection:'',
				uid:uid
			})
            yourDataRef = yourData.toString().substr(35)
			yourData.onDisconnect().remove()
        }
	})
	database.ref(yourDataRef + '/selection').on('value', function(data) {
		//console.log(yourData.child('selection').exists())
		//console.log(data.child('selection').exists())
        console.log(data.val())       
        console.log(data)       
        yourObj = data.val()
        //$('#p1pick').html()
	})
	$('input').click(function() {
		yourData.update({
			selection:this.id
		})
	})
})

