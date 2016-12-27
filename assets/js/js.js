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
				if (snapshot.numChildren) {
					
				}
				$('h2').prop('id', 'player' + playerNum)
				$('input').prop('class', 'player' + playerNum)
				database.ref('submitted/player' + playerNum).onDisconnect().set(false)
				$('#p' + playerNum + 'name').html(name)
				var yourData = database.ref('player' + playerNum).push({
					name:name,
					player:playerNum,
					wins:0
				})
				database.ref('submitted/player' + playerNum + '/name').set(name)
				//No idea why this was so important but keeping it just in case.
				yourDataKey = yourData.key
				// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
				yourData.onDisconnect().remove()
			})
        }
	})
	
	database.ref('submitted').on('value', function(snap){
		
		var player1 = snap.child('player1/name').val() || 'Player 1'
		var player2 = snap.child('player2/name').val() || 'Player 2'
		var p1selection = snap.child('player1/selection').val()
		var p2selection = snap.child('player2/selection').val()
		//Testing out game logic. Used different naming for players to avoid confusion
		function RPS(selections, firstPlayer, secondPlayer) {
			var winner
			switch (selections) {
				case 'PaperRock':
					winner = firstPlayer
					break;
				case 'PaperScissors':
					winner = secondPlayer
					break;					
				case 'RockScissors':
					winner = firstPlayer
					break;					
				case 'RockPaper':
					winner = secondPlayer
					break;					
				case 'ScissorsRock':
					winner = secondPlayer
					break;					
				case 'ScissorsPaper':
					winner = firstPlayer
					break;
				case 'PaperPaper':
				case 'ScissorsScissors':
				case 'RockRock':
					return 'Tie!'
					break;
			}
			var winMessage = `And the winner is ${winner}`
			return winMessage
		}
		//End testing
		$('#p1name').html(player1)
		$('#p2name').html(player2)

		if (p1selection && p2selection) {
			
			var seconds = 3
			$('button').html(seconds)
			var nextRoundTimer = setInterval(function() {
				$('button').html(--seconds)
			}, 1000)
			var nextRound = setTimeout(function() {
				$('.player' + playerNum).prop('disabled',false)
				database.ref('submitted/player' + playerNum + '/selection').set(false)
				clearInterval(nextRoundTimer)
				$('#p1pick').empty()
				$('#p2pick').empty()
				$('button').html('Go!')
			}, 3000)
			$('h2').html(RPS(p1selection + p2selection, player1, player2))
			$('#p1pick').html(p1selection)
			$('#p2pick').html(p2selection)			
		} else {
			snap.forEach(function(childSnap) {
				
				if (childSnap.val().selection) {
					$('#' + childSnap.key).html('Waiting for your opponent!')
					$('.' + childSnap.key).prop('disabled', true)
					if (childSnap.key == 'player1') {
						$('#player2').html('Waiting on you, bud!')
					} else {
						$('#player1').html('Waiting on you, bud!')
					}
					return true
				} else {
					$('#' + childSnap.key).html('Pick your weapon!')
				}
			})
		}
	})
	
	$('input').click(function() {
		$('button').prop('disabled', false)
		$('#p' + playerNum + 'pick').html(this.id)
	})
	$('button').click(function() {
		var updates = {}
		updates['submitted/player' + playerNum + '/selection'] = $('#p' + playerNum + 'pick').html()
		database.ref().update(updates)
		$(this).prop('disabled', true)
	})
})


