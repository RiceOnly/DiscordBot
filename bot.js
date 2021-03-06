const Discord = require('discord.js');
const auth = require('./auth.json');
const prefix = auth.prefix;

const bot = new Discord.Client({disableEveryone: true});

const clips = require('./twitchclips');
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
    let otherValue = msgArgs[3];
    let author = msg.author;
    let username = author.username;
    let tag = author.tag.trim().toLowerCase();
    
    if (author.bot) return;       
    
    switch (command) {
        case `${prefix}help`:            
            provideHelp(channel, option);
            break;

        case `${prefix}status`:
            statusUtil(guild, channel, option, value, otherValue, author);
            break;
        
        case `${prefix}show`:
            showParticipants(channel, option);
            break;
        
        case `${prefix}join`:
            joinShowdown(guild, channel, option, value, username, tag, author, msg);
            break;

        case `${prefix}leave`:
            leaveShowdown(guild, channel, option, tag, author, msg);
            break;

        case `${prefix}clip`:
            clipsUtil(channel, clips, option, value);
            break;

        case `${prefix}commands`:
            availableCommands(channel, option);
            break;
        
        case `${prefix}kick`:
            kickUser(guild, channel, option, author, msg);
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

        1. Start the command with "ss~join" and then a SPACE
        2. Type your Epic gamer tag and then a SPACE
        3. Type your partners Epic gamer tag
        3. Press ENTER
        4. <:AfroHype:473326016782270474>
        Ex. ss~join MyEpicGamerTag MyPartnerTag

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
        displayStatus = `**Status**: ${status}`;
        channel.send(`Status was updated to: ${status.charAt(0).toUpperCase()}${status.substr(1)}`);
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
        displayStatus = `**Status**: ${status.charAt(0).toUpperCase()}${status.substr(1)}`;
    } else {
        displayStatus = `**Status**: A status has not been set.`
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
 * @param {string} option 
 * @param {string} value 
 * @param {string} otherValue
 */
function updateTime(channel, value, otherValue) {
    if(otherValue) {
        if(otherValue.toLowerCase() === 'am' || otherValue.toLowerCase() === 'pm') {
            time = `${value} ${otherValue.toUpperCase()}`;
            channel.send(`Time was updated to: ${time}`);
        }
    } else {
        channel.send(`Please make sure to specify *AM* or *PM* after the time. 
        Ex. 03:30 *PM*`);
    }
}

/**
 * Provide the date of the tournament
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option
 * @param {string} value
 * @param {string} otherValue
 */
function provideDateAndTime(channel, option, value, otherValue) {
    if(date && !time) {
        displayDate = `**Tournament Date**: ${date}. A time has not been set.`;
    } else if(time && !date) {
        displayDate = `**Tournament Date**: ${time}. A date has not been set. Let's be honest, it's probably on Sunday <:FeelsDumbMan:471898989206306816>`;
    } else if(!date && !time) {
        displayDate = `**Tournament Date**: A date and time have not been provided.`;
    } else {
        displayDate = `**Tournament Date**: ${date} at ${time} <:AfroHype:473326016782270474>`;
    }
}

/**
 * Call both provideStatus and provideDateAndTime functions
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {string} option
 * @param {string} value
 * @param {string} otherValue
 */
function provideInfo(channel, option, value, otherValue) {
    provideStatus(channel, option, value);
    provideDateAndTime(channel, option, value, otherValue);
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
 * @param {string} option
 * @param {string} value
 */
function resetStatus(channel, option, value, otherValue) {
    status = undefined;
    date = undefined;
    time = undefined;

    provideInfo(channel, option, value, otherValue);
}

/**
 * Add participants to the tournament
 * @param {Guild} guild
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} gamerTag 
 * @param {string} gamerTagPartner
 * @param {string} username 
 * @param {string} tag
 * @param {string} author
 * @param {Message} msg
 */
function joinShowdown(guild, channel, gamerTag, gamerTagPartner, username, tag, author, msg) {
    // channel.send(`The username is: ${username} and the tag is: ${tag}.`);
    // channel.send(`The gamer tag you entered: ${gamerTag}.`); 
    if (gamerTag) {       
        if (!participants.has(tag)) {
            participants.set(tag, [gamerTag, gamerTagPartner]);
            guild.owner.send(`${author} has joined.`)
                .then(message => console.log(`Sent message: ${message.content}`))
                .catch(console.error);
            channel.send(`<:AfroHype:473326016782270474> Congratulations ${author}! You have been added to the list! <:AfroHype:473326016782270474>`);
            msg.react('473326016782270474');
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
 * @param {Message} msg
 */
function leaveShowdown(guild, channel, option, tag, author, msg) {
    if (!option) {
        if (participants.has(`${tag}`)) {
            participants.delete(`${tag}`);
             guild.owner.send(`${author} has left the tournament.`)
                 .then(message => console.log(`Sent message: ${message.content}`))
                 .catch(console.error);
            guild.owner.send(`${author} has left the tournament.`)
                .then(message => console.log(`Sent message: ${message.content}`))
                .catch(console.error);
            channel.send(`We hate to see you go ${author}, but you have now been removed from the tournament.`);
            msg.react('471896637112057856');
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
    let allParticipants= ``;

    if (!option) {
        participants.forEach( (value,key) => {
            allParticipants += `${key} : ${value} \n`; 
        });

        channel.send({embed: {
            color: 3447003,
            title: 'List of Participants:',
            description: allParticipants
        }});
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Select a random clip from an array
 * @param {array} array
 */
function pickRandom(array) {
    //shuffle array
    // http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
        var tmp, current, top = array.length;
        if(top) while(--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }
        return array;
    }
    a = shuffle(array);
    return a[0];
}

/**
 * Send clip from clips array
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {array} clips
 */
function sendClip(channel, clips) {
    channel.send(pickRandom(clips))
}

/**
 * Add twitch clip to clips array
 * @param {TextChannel | DMChannel | GroupDMChannel} channel
 * @param {array} clips
 * @param {string} option
 * @param {string} value
 */
function addClip(channel, clips, option, value) {
    clips.push(value);
    channel.send('Your clip has been added.');
}

/**
 * List available clips
 * @param {string} channel 
 * @param {[string]} clips 
 * @param {string} option 
 */
function listClips(channel, clips, option) {
    channel.send({embed: {
        title: 'List of Twitch Clips',
        color: 15105570,
        description: clips.join(' ')
        }});
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
            fields: [{
                name: 'Status',
                value: `

                **ss~status**  | Find out the status of the tournament

                **ss~status update** <*Yes* or *No*> | Update the status of the tournament [ONLY OWNER]

                **ss~status date** <*MM/DD/YYYY*> | Update the date of the tournament [ONLY OWNER]

                **ss~status time** <*00:00*> <*AM*/*PM*> | Update the time of the tournament [ONLY OWNER]

                **ss~status reset** | Reset tournament status, date and time [ONLY OWNER]

                `
            },
            {
                name: 'Participation',
                value: `
    
                **ss~show** | List of Participants 

                **ss~join** <*YourGamerTag* *PartnerGamerTag*> | Joining Tournament 

                **ss~leave** | Leave the tournament

                **ss~help** | Provides information on how to join

                **ss~kick** <*DiscordTag*>| Kick a usertag from the tournment list [ONLY OWNER]`
            },
            {
                name: 'Clips',
                value: `

                **ss~clip** | Show random Twitch clip

                **ss~clip add** | Add a Twitch clip

                **ss~clip list** | Lists all Twitch clips`
            }]
        }});
    }
    else {
        channel.send('Those options are not available at the moment.');
    }
}

/**
 * Utility function that handle status of the tournament
 * @param {Guild} guild
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option 
 * @param {string} value 
 * @param {User} author
 */
function statusUtil(guild, channel, option, value, otherValue, author) {
    if (!option) {
        provideInfo(channel, option, value, otherValue);
    }
    else if (option){
        updateAndResetOptions(guild, channel, option, value, otherValue, author);
    }
    else {
        channel.send('Those options are not available at the moment.');
    }  
}

/**
 * Helper function to call the update status/date/time/reset functions
 * @param {Guild} guild
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} option 
 * @param {string} value 
 * @param {string} otherValue 
 * @param {User} author
 */
function updateAndResetOptions(guild, channel, option, value, otherValue, author) {
    let guildOwner = guild.owner.id;
    let msgOwner = author.id;

    if (msgOwner == guildOwner) {
        if (option === 'update') {
            updateStatus(channel, value);    
        }
        else if (option === 'date') {
            updateDate(channel, value);
        } 
        else if (option === 'time') {
            updateTime(channel, value, otherValue);
        } 
        else if (option === 'reset') {
            resetStatus(channel, option, value, otherValue);
        }
        else {
            channel.send('Those options are not available at the moment.');
        }
    }
    else {
        channel.send('Hmm, it does not look like you have permissions to change the status. Are you sure you\'re the owner of the server <:UmbreonReally:471903092758020106>');
    }
}

/**
 * Owner can remove users from the tournament.
 * @param {Guild} guild 
 * @param {TextChannel | DMChannel | GroupDMChannel} channel 
 * @param {string} tag 
 * @param {string} author 
 * @param {string} msg 
 */
function kickUser(guild, channel, tag, author, msg) {
    let guildOwner = guild.owner.id;
    let msgOwner = author.id;

    if (msgOwner == guildOwner) {
        if (participants.has(tag)) {
            let partners = participants.get(tag);
            participants.delete(tag);
            guild.owner.send(`${tag} has been removed from the tournament along with his partner, ${partners}`)
                .then(message => console.log(`Sent message: ${message.content}`))
                .catch(console.error);
            channel.send(`${tag} has been removed from the tournament along with his partner, ${partners}`);
        }
        else { 
            channel.send('User does not exist in the tournament.');
        }
    }
    else {
        channel.send('You are not the owner of this server.')
    }
}

/**
 * Add twitch clips found in the list of clips
 * @param {string} channel 
 * @param {[string]} clips 
 * @param {string} option 
 * @param {string} value 
 */
function clipsUtil(channel, clips, option, value) {
    if(!option) {
        sendClip(channel, clips);
    }
    else if(option === 'add') {
        addClip(channel, clips, option, value);
    }
    else if(option === 'list') {
        listClips(channel, clips, option);
    }
     else {
        channel.send('Those options are not available at the moment.');
    }
}