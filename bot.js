const Discord = require('discord.js');
const auth = require('./auth.json');
const prefix = auth.prefix;

const bot = new Discord.Client({disableEveryone: true});
let status;
let displayStatus;
let date;
let time;
let displayDate;
let participants = new Map();
let assistMessage = 'Type *ss~commands* to view all available commands.';

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

        case `${prefix}reset`:
            resetStatus(channel);
            break;
        
        case `${prefix}show`:
            showParticipants(channel, option);
            break;
        
        case `${prefix}join`:
            joinShowdown(guild, channel, option, username, tag, author);
            msg.react('473326016782270474');
            break;

        case `${prefix}leave`:
            leaveShowdown(guild, channel, option, tag, author);
            msg.react('471896637112057856');
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
        channel.send({embed: {
            title: 'Joining SundayShowdown',
            color: 15105570,
            description: `To join SundayShowdown, please follow the below instructions:

        1. Start the response with "ss~join" and then a space
        2. Put your Epic gamer tag after the space
        3. Press enter
        4. <:AfroHype:473326016782270474>
        Ex. ss~join MyEpicGamerTag

        ${assistMessage}`
        }});
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
    if (value.toLowerCase().trim() === 'no' || value.toLowerCase().trim() === 'yes') {
        status = `${value}`;
        displayStatus = `Status: ${status}`;
        channel.send(`Status was updated to: ${status}`);
    } else {
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
    if(status) {
    displayStatus = `Status: ${status}`;
    } else {
        displayStatus = `__Status__: A status has not been set.`
    }
    
}

/**
 * Update the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} value 
 */
function updateDate(channel, value) {
    date = `${value}`;
    channel.send(`Date was updated to: ${date}`);
}

/**
 * Update the time of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} value 
 */
function updateTime(channel, value) {
    time = `${value}`;
    channel.send(`Time was updated to: ${time}`);
}

/**
 * Provide the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 * @param {string} value
 * @param {string} displayDate
 * @param {string} date
 * @param {string} time
 */
function provideDateAndTime(channel, option, value) {
    if(date && !time) {
        displayDate = `__Tournament Date__: ${date}. A time has not been set.`
    } else if(time && !date) {
        displayDate = `__Tournament Date__: ${time}. A date has not been set. Let's be honest, it's probably on Sunday <:FeelsDumbMan:471898989206306816>`
    } else if(!date && !time){
        displayDate = `__Tournament Date__: A date and time have not been provided.`
    } else {
        displayDate = `__Tournament Date__: ${date} at ${time} <:AfroHype:473326016782270474>`
    }
}

/**
 * Call both provideStatus and provideDateAndTime functions
 */
function provideInfo(channel, option, value) {
    provideStatus(channel, option, value);
    provideDateAndTime(channel, option, value);
    channel.send({embed: {
            title: 'SundayShowdown Information',
            color: 15105570,
            description: `${displayStatus}

            ${displayDate}

            ${assistMessage}`
        }});
}        

/**
 * Reset status, date and time of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {string} status
 * @param {string} date
 * @param {string} time
 */
function resetStatus(channel) {
    status = undefined;
    date = undefined;
    time = undefined;

    provideInfo(channel, option);
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
            channel.send(`<:AfroHype:473326016782270474> Congratulations ${author}! You have been added to the list! <:AfroHype:473326016782270474>`);
        }
        else {
            channel.send('You have already joined the list.');
        }
    }
}

/**
 * Remove oneself from the participants list
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {Guild} guild
 * @param {string} option 
 * @param {string} tag 
 * @param {string} author
 */
function leaveShowdown(guild, channel, option, tag, author) {
    if (!option) {
        if (participants.has(`${tag}`)) {
            participants.delete(`${tag}`);
             guild.owner.send(`${author} has left the tournament.`)
                 .then(message => console.log(`Sent message: ${message.content}`))
                 .catch(console.error);
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
        //PROBLEM - not sure how to print participants into embed
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
        channel.send({embed: {
            color: 15105570,
                title: 'Available Commands',
                description: `
        __ss~status__  | Find out the status of the tournament

        __ss~status update__ <*Yes* or *No*> | Update the status of the tournament

        __ss~status date__ <*MM/DD/YYYY*> | Update the date of the tournment

        __ss~status time__ <*00:00*> | Update the time of the tournament

        __ss~reset__ | Reset tournament status, date and time
        
        __ss~show__ | List of Participants 

        __ss~join__ <*Gamer Tag*> | Joining Tournament 

        __ss~leave__ | Leave the tournment

        __ss~help__ | Provides information on how to join`
    }});
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
        provideInfo(channel, option);
    }
    else if (option === 'update') {
        updateStatus(channel, value);
    }
    else if (option === 'date') {
        updateDate(channel, value);
    } 
    else if (option === 'time') {
        updateTime(channel, value);
    } 
    else {
        channel.send('Those options are not available at the moment.');
    }  
}
