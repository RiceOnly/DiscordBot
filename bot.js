var Discord = require('discord.js');
var auth = require('./auth.json');

var bot = new Discord.Client({disableEveryone: true});

bot.on('ready', async () => {
    console.log(`Sunday Showdown Bot is ready! ${bot.user.username}`);

    try{
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch(e) {
        console.log(e.stack);
    }

});

// REQUIREMENTS
// Making Registration easier
// Users enter their information to the bot and the bot records it
// Users discord name and game id

bot.on('message', async msg => {
    const channel = msg.channel;
    // Provide General Information
    if (msg.content === 'SS~help') {
        channel.send('To join SundayShowdown, please follow the below instructions:\n'
                     + '1. Start the response with "SS~join" and then a space\n'
                     + '2. Put your Epic gamer tag after the space\n'
                     + '3. Enter\n'
                     + '\n'
                     + 'Ex.\n'
                     + 'SS~join <myEpicGamerTag>\n'
                    );
    }

    let msgArgs = msg.channel.lastMessage.content.split(' ');
    let command = msgArgs[0];

    if (command === 'SS~join'){
        let author = msg.author;
        let username = author.username;
        let tag = author.tag;
        console.log('The username is:' + username + ' and the tag is:' + tag);
    
        let gamerTag = msgArgs[1];
        console.log('The gamer tag is: ' + gamerTag);

        channel.send('You have been added to the list');
    }

    if (msg.content === 'SS~status') {
        channel.send('Cancelled');
    }
});


bot.login(auth.token);