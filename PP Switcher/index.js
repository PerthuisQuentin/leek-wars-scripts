const Fs = require('fs');
const Request = require('request');
const Restler = require('restler');

// Check Leek Wars identifiers
if(!process.env.LW_USERNAME) {
    console.log("Can't find user environnement variable for Leek Wars");
    process.exit(1);
}
if(!process.env.LW_PASSWORD) {
    console.log("Can't find password environnement variable for Leek Wars");
    process.exit(1);
}

var imgDir = JSON.parse(Fs.readFileSync('./config.json')).imgDir;

const username = process.env.LW_USERNAME;
const password = process.env.LW_PASSWORD;

// Read the /img directory
Fs.readdir(imgDir, (err, files) => {
	if(err) return console.log(err);
	if(!files.length) return console.log('/img directory if empty.');

	var randFile = randomInt(0, files.length);

	updateAvatar(imgDir + files[randFile]);
});

// Connect to Leek Wars and update the avatar
function updateAvatar(filePath) {
	// Retrieve token
	Request({
		url: 'https://leekwars.com/api/farmer/login-token/' + username + '/' + password
	}, (error, response, body) => {
		if(error) {
			console.log(error);
			return;
		}
		if(response.statusCode != 200) {
			console.log(response);
			return;
		}

		var token = JSON.parse(body).token;

		// Update avatar
		Fs.stat(filePath, (err, stats) => {
		    Restler.post('https://leekwars.com/api/farmer/set-avatar/avatar', {
		        multipart: true,
		        data: {
		            "token": token,
		            "avatar": Restler.file(filePath, null, stats.size, null, "image/png")
		        }
		    }).on("complete", data => {
		        console.log(data);
		    });
		});
	});
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}