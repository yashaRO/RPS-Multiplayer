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
var yourDataKey

$(document).ready(function() {
	
	var playerNum = 1
	var enemyNum = 2
	var name = prompt('What is your name?')
	
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
        } else {
            console.log('No User')
            // User is signed out.
        }
        // ...
	})

	database.ref('.info/connected').on('value', function(snap) {
        if (snap.val()) {
			database.ref('connections').push(true).onDisconnect().remove()
			database.ref('connections').once('value', function(snapshot) {
				if (snapshot.numChildren() >= 3) {
					alert('Server full'); 
					window.location.assign('https://google.com')
				}
			})
			database.ref().once('value', function(snapshot) {
				if (snapshot.hasChild('player1')) {
					playerNum = 2
					enemyNum = 1
				}
				$('h2').prop('id', 'player' + playerNum)
				database.ref('submitted/player' + playerNum).onDisconnect().set(false)
				$('#p' + playerNum + 'name').html(name)
				var yourData = database.ref('player' + playerNum).push({
					name:name,
					player:playerNum,
					wins:0
				})
				//No idea why this was so important but keeping it just in case.
				yourDataKey = yourData.key
				// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				yourData.onDisconnect().remove()
			})
        }
	})
	
	database.ref('submitted').on('value', function(snap){
		if (snap.child('player1').val() && snap.child('player2').val()) {
			$('h2').html('Player1 picked: ' + snap.child('player1').val() + '<br>Player2 picked: ' + snap.child('player2').val())
			$('input').prop('disabled', false)
		} else {
			snap.forEach(function(childSnap) {
				if (childSnap.val()) {
					$('#' + childSnap.key).html('Waiting for your opponent!')
				}
			})
		}
	})
	
	$('input').click(function() {
		$('button').prop('disabled', false)
		$('#p'+ playerNum + 'pick').html(this.id)
	})
	$('button').click(function() {
		var updates = {}
		updates['submitted/player' + playerNum] = $('#p' + playerNum + 'pick').html()
		database.ref().update(updates)
		$(this).prop('disabled', true)
		$('input').prop('disabled', true)
	})
})


