const users = [];

// Join user to chat
function userJoin(id, username, room, team) {
	if (team === undefined) {
		const blueTeam = users.filter((user) => user.team === 'blue');
		const redTeam = users.filter((user) => user.team === 'red');
		const teams = ['blue', 'red'];

		if (blueTeam.length > redTeam.length) {
			team = 'red';
		} else if (blueTeam.length < redTeam.length) {
			team = 'blue';
		} else {
			team = teams[Math.floor(Math.random() * teams.length)];
		}
	}
	const user = { id, username, room, team };

	users.push(user);
	console.log(users);
	return user;
}

// Get current user
function getCurrentUser(id, leaving) {
	console.log('getCurrentUser ', id, leaving);
	if (leaving) {
		// User leaves chat
		return users.splice(users.indexOf(id), 1);
	} else {
		return users.find((user) => user.id === id);
	}
}

function chooseActivePlayer(room) {
	console.log('chooseActivePlayer in room: ', room);
	console.log(users.filter((user) => user.room === room));
	if (users.length >= 2) {
		const roomUsers = getRoomUsers(room);
		const activePlayer =
			roomUsers[Math.floor(Math.random() * roomUsers.length)];
		return activePlayer;
	}
}

// Get room users
function getRoomUsers(room) {
	return users.filter((user) => user.room === room);
}

function getRoomNumbers() {
	return users.map((user) => user.room);
}

export { userJoin, getRoomUsers, getCurrentUser, getRoomNumbers, chooseActivePlayer };
