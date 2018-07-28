const Discord = require('discord.js');
const auth = require('./auth.json');

const bot = new Discord.Client({disableEveryone: true});
let status = 'Status: ';
let date = 'Tournament Date: ';
let participants = new Map();

bot.on('ready', async () => {
    console.log(`Sunday Showdown Bot is ready! ${bot.user.username}`);

    // try{
    //     let link = await bot.generateInvite(["ADMINISTRATOR"]);
    //     console.log(link);
    // } catch(e) {
    //     console.log(e.stack);
    // }

});

bot.on('message', async msg => {
    const channel = msg.channel;
    let msgArgs = msg.channel.lastMessage.content.split(' ');
    let command = msgArgs[0];
    let option = msgArgs[1];
    let value = msgArgs[2];
    let author = msg.author;
    let username = author.username;
    let tag = author.tag;

    switch (command) {
        case 'ss~help':
            if (!option) {
                provideHelp(channel);
            }
            break;

        case 'ss~status':
            if (!option) {
                provideStatus(channel);
                provideDate(channel);
            }
            else if (option === 'update') {
                updateStatus(channel, value);
            }
            else if (option === 'date') {
                date = `Tournament Date: ${value}`;
                channel.send(`Date was updated to: ${value}`);
            }
            break;
        
        case 'ss~show':
            if (!option) {
                showParticipants(channel);
            }
        
        case 'ss~join':
            if (option) {
                joinShodown(channel, option, author, username, tag);
            }
            break;
        case 'ss~commands':
            if (!option) {
                availableCommands(channel);
            }
            break;
    }
});


bot.login(auth.token);

/**
 * Provide general help information on joining the SundayShowdown tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 */
function provideHelp(channel) {
    channel.send(`To join SundayShowdown, please follow the below instructions:
    1. Start the response with "ss~join" and then a space
    2. Put your Epic gamer tag after the space
    3. Enter
    
    Ex.
    ss~join myEpicGamerTag`
    );
}

/**
 * Update the status of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} msg 
 */
function updateStatus(channel, msg) {
    if (msg.toLowerCase().trim() === 'no') {
        status = 'Status: No';
        channel.send(`Status was updated to: ${msg}`);
    }
    else if (msg.toLowerCase().trim() === 'yes') {
        status = 'Status: Yes';
        channel.send(`Status was updated to: ${msg}`);
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Provide the status of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 */
function provideStatus(channel) {
    channel.send(status);
}

/**
 * Provide the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 */
function provideDate(channel) {
    channel.send(date);
}

/**
 * Add participants to the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} gamerTag 
 * @param {string} username 
 * @param {string} tag 
 */
function joinShodown(channel, gamerTag, username, tag) {
        // channel.send(`The username is: ${username} and the tag is: ${tag}.`);
        // channel.send(`The gamer tag you entered: ${gamerTag}.`);        
        if (!participants.has(`${tag}`)) {
            participants.set(`${tag}`, `${gamerTag}`);
            channel.send('You have been added to the list');
        }
        else {
            channel.send('You have already joined the list.')
        }    
}

/**
 * Show the list of participants
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 */
function showParticipants(channel) {
    channel.send('List of Participants');
    participants.forEach( (value,key) => {
        channel.send(key + ':' + value + '\n');
    });
}

/**
 * Show the available commands
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 */
function availableCommands(channel) {
    channel.send(`Available commands:
    ss~status | (update | date) : update = Yes or No, date = (MM/DD/YYY)
    ss~show : List of Participants 
    ss~join <string> : Joining Tournament 
    ss~help : How To Join`);
}