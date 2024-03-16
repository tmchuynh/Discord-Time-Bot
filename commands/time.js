export const triggers = ['time'];

/**
 * @desc The function that's triggered by the onMessage event
 * @param {Object} msg Message object from Discord.js
 */
export default function run(msg) {
    let parentModule = this;
    let command = msg.content.replace(/( {2,})/g, ' ').split(' ');
    let hasPerms = new Discord.Permissions(msg.member.permissions.bitfield);
    hasPerms = hasPerms.has('ADMINISTRATOR') || hasPerms.has('MANAGE_GUILD');
    let config = storage.getItemSync(msg.guild.id);
    let thisServer = {};
    if (config) {
        thisServer = JSON.parse(config);
    }

    if (command.length === 1) {
        if (hasPerms) {
            let response = {
                name: 'Status'
            };
            let color = colorConfig.neutral;
            if (Object.keys(thisServer).length) {
                color = colorConfig.good;
                response.value = ":white_check_mark: All set for **" + msg.guild.name + "**. \n\nFeel free to run `!time help` for configuration & more information.";
            } else {
                color = colorConfig.bad;
                response.value = ":exclamation: Not yet configured. \n\nPlease run `!time start` to get set up. It's a super quick process.";
            }
            msg.channel.send(new Discord.RichEmbed({
                color: color,
                title: botConfig.title,
                description: ' ',
                url: '',
                fields: [response]
            }));
        } else {
            errorResponse('');
        }
    } else {
        switch (command[1]) {
            case 'start':
                if (hasPerms) {
                    if (!Object.keys(thisServer).length) {
                        msg.channel.send(new Discord.RichEmbed({
                            color: colorConfig.good,
                            title: botConfig.title,
                            description: 'Initial setup for **' + msg.guild.name + '**',
                            url: '',
                            fields: [{
                                name: 'Adding server to our database..',
                                value: "It looks like this server is in **" + msg.guild.region + "**, so to speed up the process we're setting your default timezone to **" + defaultConfig.zones[msg.guild.region] + "**. \n\n" +
                                    "If this is incorrect, or you would like to customize the timezone further, `!time zone` will provide you with more information. You can also use `!time format` to change how the time/date is displayed. \n\n:thumbsup: That's it! You're good to go."
                            }]
                        }));
                        let thisServer = {};
                        console.log("Setting defaults for " + msg.guild.name);
                        if (defaultConfig.zones[msg.guild.region]) {
                            thisServer.zone = defaultConfig.zones[msg.guild.region];
                        } else {
                            thisServer.zone = defaultConfig.zone;
                        }
                        thisServer.format = defaultConfig.format;
                        thisServer.owner = msg.member.displayName;
                        storage.setItemSync(msg.guild.id, JSON.stringify(thisServer));
                        msg.guild.fetchMember(bot.user).then(function (member) {
                            member.setNickname(moment().tz(thisServer.zone).format(thisServer.format));
                        });
                    } else {
                        errorResponse('', 'Cannot add server to database.', 'Server already exists, so this command never has to be run again.');
                    }
                } else {
                    errorResponse('set');
                }
                break;
            case 'zone':
                if (hasPerms) {
                    if (command[2] && hasPerms) {
                        let newZone = command[2];
                        if (moment.tz.zone(newZone)) {
                            thisServer.zone = newZone;
                            storage.setItemSync(msg.guild.id, JSON.stringify(thisServer));
                            msg.channel.send(new Discord.RichEmbed({
                                color: colorConfig.good,
                                title: botConfig.title,
                                description: ' ',
                                url: '',
                                fields: [{
                                    name: 'Timezone successfully updated',
                                    value: "Set to " + thisServer.zone
                                }]
                            }));
                        } else {
                            msg.channel.send(new Discord.RichEmbed({
                                color: colorConfig.bad,
                                title: botConfig.title,
                                description: ' ',
                                url: '',
                                fields: [{
                                    name: 'Sorry, that\'s not a valid timezone. \nRun `!time zone` for full details.',
                                    value: "For now, we're sticking with " + thisServer.zone
                                }]
                            }));
                        }
                    } else {
                        msg.channel.send(new Discord.RichEmbed({
                            color: colorConfig.good,
                            title: botConfig.title,
                            description: ' ',
                            url: '',
                            fields: [{
                                name: "Current timezone: " + thisServer.zone,
                                value: "It's currently " + moment().tz(thisServer.zone).format(thisServer.format)
                            }]
                        }));
                    }
                } else {
                    errorResponse('set');
                }
                break;
            // Other cases...
        }
    }
}
