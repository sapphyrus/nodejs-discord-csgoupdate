// Requirements
const { Client } = require('discord.js');
const { exec } = require('child_process');
const mysql = require('mysql');
const RssFeedEmitter = require('rss-feed-emitter');
const htmlToText = require('html-to-text');
const log = require('npmlog');

// Create feeder instance
const feeder = new RssFeedEmitter({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'});

// Create Discord Bot Instance
const bot = new Client();

// Load Config
const cfg = require('./config.json');

// MySQL Database Connection
const db = mysql.createConnection(cfg.mysql);
if (cfg.mysql.user === 'root') log.warn('mysql', 'Using the root user in production is highly discouraged');

// MySQL Connection log
db.connect(err => {
  if (err) {
    log.error('mysql', "Can't connect to server:\n%s", err.stack);
    return process.exit();
  }
  log.info('mysql', 'Connection successful (%s:%d)', cfg.mysql.host, cfg.mysql.port);
});

// Logging into Bot Account
bot.on('ready', () => {
  log.info('discord', `Logged in as ${bot.user.tag} (User ID: ${bot.user.id}) on ${bot.guilds.size} server(s)`);
  bot.user.setActivity('Fetching Updates');
  setInterval(rssTimer, 60000);
});

function rssTimer() {
  // Get date of current day
  let getDate = new Date();
  let date = ((getDate.getMonth() +1) +'/'+ getDate.getDate() +'/'+ getDate.getFullYear());

  // Set feeder URL
  feeder.add({
    url: 'http://blog.counter-strike.net/index.php/category/updates/feed/'
  });

  db.query(`SELECT * FROM cs_updates WHERE date='${date}'`, (err, rows, fields) => {
    if (err) return log.error('mysql', 'Query failed:\n%s', err.stack);

    // Set variable for the SQL query
    let sql_date = [];

    // Insert into variable
    rows.forEach((rows) => {
      sql_date = rows.date;
    });

    // Check if Update has been posted already. If not, continue.
    if (sql_date.constructor === Array && sql_date.length === 0) {
      feeder.on('new-item', function(item) {
        if (item.title.includes(`${date}`)) {
          let text = htmlToText.fromString(item.description, {
            wordwrap: 130
          });
          let textLimited = text.substr(0, 750)

          // Sending Discord Message
          bot.channels.get(cfg.channelid).send("@everyone A new CS:GO Update has been released!", {
            embed: {
              "title": `${item.title}`,
              "description": `${textLimited}...\n\n[Continue reading on the CS:GO Blog](${item.link})`,
              "url": `${item.link}`,
              "color": 5478908,
              "thumbnail": {
                "url": "https://trinia.pro/file/09vvh.png"
              }
            }
          });
          db.query(`INSERT INTO cs_updates (date) VALUES ('${date}')`);

          // Restarting the Bot to prevent spam
          exec(`pm2 restart csgoupdatebot`, (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
            }
        });
        }
      });
    } else {
      // Do nothing if update has been posted already.
    }
  });
}

bot.login(cfg.token);
