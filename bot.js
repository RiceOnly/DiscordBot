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
        channel.send('');
    }

    if (msg.content === 'SS~join'){
        channel.send('');
    }
});


bot.login(auth.token);