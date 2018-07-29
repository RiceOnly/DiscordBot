const Discord = require('discord.js');
const auth = require('./auth.json');
const prefix = auth.prefix;

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
    const guild = msg.guild;
    
    let msgArgs = msg.channel.lastMessage.content.split(' ');
    let command = msgArgs[0];
    let option = msgArgs[1];
    let value = msgArgs[2];
    let author = msg.author;
    let username = author.username;
    let tag = author.tag.trim();

    if (author.bot) return;       

    switch (command) {
        case `${prefix}help`:            
            provideHelp(channel, option);
            break;

        case `${prefix}status`:
            statusUtil(channel, option, value);
            break;
        
        case `${prefix}show`:
            showParticipants(channel, option);
            break;
        
        case `${prefix}join`:
            joinShowdown(guild, channel, option, username, tag, author);
            break;

        case `${prefix}leave`:
            leaveShowdown(channel, option, tag, author);
            break;

        case `${prefix}commands`:
            availableCommands(channel, option);
    }
});


bot.login(auth.token);

/**
 * Provide general help information on joining the SundayShowdown tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {string} option
 */
function provideHelp(channel, option) {
    if (!option) {
        channel.send(`To join SundayShowdown, please follow the below instructions:
        1. Start the response with "ss~join" and then a space
        2. Put your Epic gamer tag after the space
        3. Enter
        
        Ex.
        ss~join myEpicGamerTag`
        );
    } 
    else {
        channel.send('Those options are not available at the moment.');
    }
    
}

/**
 * Update the status of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} value 
 */
function updateStatus(channel, value) {
    if (value.toLowerCase().trim() === 'no') {
        status = 'Status: No';
        channel.send(`Status was updated to: ${value}`);
    }
    else if (value.toLowerCase().trim() === 'yes') {
        status = 'Status: Yes';
        channel.send(`Status was updated to: ${value}`);
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Provide the status of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 * @param {string} value
 */
function provideStatus(channel, option, value) {
    channel.send(status);
    
}

/**
 * Update the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} value 
 */
function updateDate(channel, value) {
    date = `Tournament Date: ${value}`;
    channel.send(`Date was updated to: ${value}`);
}

/**
 * Provide the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 * @param {string} value
 */
function provideDate(channel, option, value) {
    channel.send(date);
}

/**
 * Add participants to the tournament
 * @param {Guild} guild
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} gamerTag 
 * @param {string} username 
 * @param {string} tag
 * @param {string} author
 */
function joinShowdown(guild, channel, gamerTag, username, tag, author) {
    // channel.send(`The username is: ${username} and the tag is: ${tag}.`);
    // channel.send(`The gamer tag you entered: ${gamerTag}.`); 
    if (gamerTag) {       
        if (!participants.has(`${tag}`)) {
            participants.set(`${tag}`, `${gamerTag}`);
            guild.owner.send(`${author} has joined.`)
                .then(message => console.log(`Sent message: ${message.content}`))
                .catch(console.error);
            channel.send(`Congratulations ${author}! You have been added to the list`);
        }
        else {
            channel.send('You have already joined the list.');
        }
    }
}

/**
 * Remove oneself from the participants list
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {string} option 
 * @param {string} tag 
 * @param {string} author
 */
function leaveShowdown(channel, option, tag, author) {
    if (!option) {
        if (participants.has(`${tag}`)) {
            participants.delete(`${tag}`);
            channel.send(`We hate to see you go ${author}, but you have now been removed from the tournament.`);
        }
        else {
            channel.send('You have not joined the tournment.');
        }
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Show the list of participants
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 */
function showParticipants(channel, option) {
    if (!option) {
        channel.send('List of Participants:');
        participants.forEach( (value,key) => {
            channel.send(key + ':' + value + '\n');
        });
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Show the available commands
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 */
function availableCommands(channel, option) {
    if (!option) {
        channel.send(`Available commands:
        ss~status  : Find out the status of the tournament
        ss~status update <Yes or No> : Update the status of the tournament
        ss~status date <MM/DD/YYYY> : Update the date of the tournment
        
        ss~show : List of Participants 

        ss~join <Gamer Tag> : Joining Tournament 
        ss~leave : Leave the tournment

        ss~help : Provides information on how to join`);
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Utility function that handle status of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option 
 * @param {string} value 
 */
function statusUtil(channel, option, value) {
    if (!option) {
        provideStatus(channel, option);
        provideDate(channel, option);
    }
    else if (option === 'update') {
        updateStatus(channel, value);
    }
    else if (option === 'date') {
        updateDate(channel, value);
    }  
    else {
        channel.send('Those options are not available at the moment.');
    }  
}
