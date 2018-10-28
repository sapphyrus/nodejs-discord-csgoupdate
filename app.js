// Requirements
const { Client } = require('discord.js');
const fs = require('fs');
const RssFeedEmitter = require('rss-feed-emitter');
const htmlToText = require('html-to-text');
const log = require('npmlog');

// Load Config
const cfg = require('./config.json');

// Create feeder instance
const feeder = new RssFeedEmitter({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'});

// Setting last update variable
let lastDate;

function getLastDate() {
        // Getting date of last update from check-update.txt file
        let fileDate = fs.readFileSync('check-update.txt');
        lastDate = fileDate.toString();
}

// Getting last date from check-update.txt file every 15 seconds
setInterval(getLastDate, 15000);

// Create Discord Bot Instance
const bot = new Client();

// Logging into Bot Account
bot.on('ready', () => {
    log.info('discord', `Logged in as ${bot.user.tag} (User ID: ${bot.user.id}) on ${bot.guilds.size} server(s)`);
    bot.user.setActivity('Fetching Updates');

    // Checking all 30 seconds, if there's a new update, and if it's been posted already
    setInterval(getUpdate, 30000);
  });

function getUpdate() {
    // Get date of current day and format it
    let getDate = new Date();
    let currentDate = ((getDate.getMonth() +1) +'/'+ getDate.getDate() +'/'+ getDate.getFullYear());

    // Set feeder URL
    feeder.add({
        url: 'http://blog.counter-strike.net/index.php/category/updates/feed/'
    });

    feeder.on('new-item', function(item) {
        let format = htmlToText.fromString(item.description, {
            wordwrap: 130
        });

        // Limiting the update to 10 lines
        var BlogPost = format.split('\n', 10);

        if (item.title.includes(`${currentDate}`)) {
            if (lastDate !== currentDate) {
                bot.channels.get(cfg.channelid).send("@everyone A new CS:GO Update has been released!", {
                    embed: {
                      "title": `${item.title}`,
                      "description": `${BlogPost.join('\n')}...\n\n[Continue reading on the CS:GO Blog](${item.link})`,
                      "url": `${item.link}`,
                      "color": 5478908,
                      "thumbnail": {
                        "url": "https://raw.githubusercontent.com/Triniayo/nodejs-discord-csgoupdate/master/csgo-icon.png"
                      }
                    }
                  });

                // Storing date of the latest update in the check-update.txt
                fs.writeFileSync('check-update.txt', `${currentDate}`)
            }
        } else {
            // Do nothing if update has been posted already.
        }
    });

}

bot.login(cfg.token);
