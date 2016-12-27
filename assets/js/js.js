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

$(document).ready(function() {
	
	var playerNum = 1
	var enemyNum = 2
	var name = prompt('What is your name?')
	var score = 0
	
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
			database.ref('connections').once('value', function(snapshot) {
				if (snapshot.numChildren() >= 3) {
					alert('Server full'); 
					window.location.assign('https://google.com')
				}
				if (snapshot.hasChild('player1')) {
					playerNum = 2
				}
				database.ref('connections/player' + playerNum).push(true).onDisconnect().remove()
				$('h2').prop('id', 'player' + playerNum)
				$('input').prop('class', 'player' + playerNum)
				$('#p' + playerNum + 'name').html(name)
				database.ref('players/player' + playerNum).onDisconnect().set(false)
				database.ref('players/player' + playerNum).set({
					name: name || 'Player ' + playerNum,
					score:0
				})
			})
        }
	})
	
	database.ref('players').on('value', function(snap){
		
		var player1 = snap.child('player1/name').val()
		var player2 = snap.child('player2/name').val()
		var p1selection = snap.child('player1/selection').val()
		var p2selection = snap.child('player2/selection').val()
		var p1score = snap.child('player1/score').val()
		var p2score = snap.child('player2/score').val()
		var whoWon
		function RPS(selections, firstPlayer, secondPlayer) {
			var winner
			switch (selections) {
				case 'PaperRock':
					winner = firstPlayer
					whoWon = 1
					break;
				case 'PaperScissors':
					winner = secondPlayer
					whoWon = 2
					break;					
				case 'RockScissors':
					winner = firstPlayer
					whoWon = 1
					break;					
				case 'RockPaper':
					winner = secondPlayer
					whoWon = 2
					break;					
				case 'ScissorsRock':
					winner = secondPlayer
					whoWon = 2
					break;					
				case 'ScissorsPaper':
					winner = firstPlayer
					whoWon = 1
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
				database.ref('players/player' + playerNum + '/selection').set(false)
				clearInterval(nextRoundTimer)
				$('#p1pick').empty()
				$('#p2pick').empty()
				$('button').html('Go!')
				database.ref('players/player' + whoWon).update({score:snap.child('player' + whoWon + '/score').val() + 1})
			}, 3000)
			$('h2').html(RPS(p1selection + p2selection, player1, player2))
			$('#p1pick').html(p1selection)
			$('#p2pick').html(p2selection)	
		} else {
			snap.forEach(function(childSnap) {
				
				if (childSnap.val().selection) {
					$('#' + childSnap.key).html('Waiting for your opponent!')
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
		
		$('#p1score').html(p1score)
		$('#p2score').html(p2score)
	})
	
	$('input').click(function() {
		$('button').prop('disabled', false)
		$('#p' + playerNum + 'pick').html(this.id)
	})
	$('button').click(function() {
		var updates = {}
		updates['players/player' + playerNum + '/selection'] = $('#p' + playerNum + 'pick').html()
		database.ref().update(updates)
		$(this).prop('disabled', true)
		$('.player' + playerNum).prop('disabled', true)
	})
})


