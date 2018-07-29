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
    channel.send(displayStatus);
    } else {
        channel.send(`__Status__: A **status** has not been set. Use *ss~status update* <**yes** or **no**> to update the tournament status.`)
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
        displayDate = `__Tournament Date__: **${date}**. A **time** has not been set. Use *ss~status time* <**00:00**> to update the time.`
        channel.send(displayDate);
    } else if(time && !date) {
        displayDate = `__Tournament Date__: **${time}**. A **date** has not been set. Let's be honest, it's probably on Sunday :/, but use *ss~status date* <**MM/YYYY**> to update the date anyway because <:FeelsDumbMan:471898989206306816>`
        channel.send(displayDate);
    } else if(!date && !time){
        channel.send(`__Tournament Date__: A **date** and **time** have not been provided. Use *ss~status date* <**MM/YYYY**> to update the date, and *ss~status time* <**00:00**> to update the time.`)
    } else {
        displayDate = `__Tournament Date__: **${date}** at **${time}**`
        channel.send(displayDate);
    }
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

    provideStatus(channel, option);
    provideDateAndTime(channel, option);
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
        channel.send(`\`\`\`Available commands:
        ss~status  : Find out the status of the tournament
        ss~status update <Yes or No> : Update the status of the tournament
        ss~status date <MM/DD/YYYY> : Update the date of the tournment
        ss~status time <00:00> : Update the time of the tournament
        ss~reset : resets tournament status, date and time
        
        ss~show : List of Participants 

        ss~join <Gamer Tag> : Joining Tournament 
        ss~leave : Leave the tournment

        ss~help : Provides information on how to join\`\`\``);
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
        provideStatus(channel, option, value);
        provideDateAndTime(channel, option, value);
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
