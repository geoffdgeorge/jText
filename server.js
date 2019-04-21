require(`dotenv`).config();
const axios = require(`axios`);
const twilio = require(`twilio`);
const keys = require(`./keys`);
const schedule = require(`node-schedule`);
const express = require(`express`);
const path = require(`path`);

const app = express();

app.get(`/`, (req, res) => {
	res.json(path.join(__dirname, `./index.html`))
})

const PORT = process.env.PORT || 4500;

const client = new twilio(keys.server.SID, keys.server.token);

const rule = new schedule.RecurrenceRule();
rule.hour = [8, 12, 22];
rule.minute = 30;

schedule.scheduleJob(rule, function() {
	axios
		.get(`http://jservice.io/api/random`)
		.then(response => {
			client.messages.create({
				to: keys.server.targetNum,
				from: keys.server.myPhoneNum,
				body: `\nCategory: ${response.data[0].category.title.toUpperCase()}\nClue: ${
					response.data[0].question
				}`
			});

			function answer() {
				client.messages.create({
					to: keys.server.targetNum,
					from: keys.server.myPhoneNum,
					body: response.data[0].answer
				});
			}

			setTimeout(answer, 180000);
		})
		.catch(err => {
			if (err) {
				console.log(err);
			}
		});
});

app.listen(PORT, () => {
	console.log(`Application listening on PORT ${PORT}`);
});

/*

SOURCING

* https://www.twilio.com/blog/2016/04/send-text-in-javascript-node-in-30-seconds.html

*/