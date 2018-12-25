var tmi = require('tmi.js');
var request = require('request');
const express = require('express');
const app = express();
const userChannel = process.env.CHANNEL;

var ans;
var options = {
        options: {
                debug: true
        },
        connection: {
                reconnect: true
        },
        identity: {
                username: process.env.USERNAME,
                password: process.env.OAUTH_TOKEN
        },
        channels: [userChannel]
};

var client = new tmi.client(options);
// Connect the client to the server
client.connect();
client.on('chat', function(channel, userstate, message, self){
        if(message.includes("@"+process.env.USERNAME)){ // checking if SUSI is tagged
                var u = message.split("@" + process.env.USERNAME + " ");
                // Setting options to make a successful call to SUSI API
                var options1 = {
                        method: 'GET',
                        url: 'http://api.susi.ai/susi/chat.json',
                        qs:
                        {
                                timezoneOffset: '-300',
                                q: u[1]
                        }
                };
                request(options1, function(error, response, body) {
                        if (error) throw new Error(error);
                        if((JSON.parse(body)).answers[0])
                                ans = userstate['display-name'] + " " + (JSON.parse(body)).answers[0].actions[0].expression;
                        else
                                ans = userstate['display-name'] + " Sorry, I could not understand what you just said."
                
                        client.action(userChannel, ans);
                });
        }
});

client.on('connected', function(address, port){
        client.action(userChannel, `Hi, I'm a bot. Mention me using @${process.env.USERNAME} to chat with me.`);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Listening on ${port}`);
});