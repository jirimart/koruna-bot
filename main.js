const dotenv = require('dotenv').config().parsed;
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const fetch = require('node-fetch');

// // loads commands and gives them to Discord
// client.commands = new Discord.Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	client.commands.set(command.name, command);
// }

/* async function main() {
  try {
    var quote = await getQuote();
    console.log(quote);
  } catch (error) {
    console.error(error);
  }
}*/

const sendData = async () => {
  try {
    const priceResponse = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json", {"method":"GET"});
    const price = await priceResponse.json();
    
    const rate = price.bpi.EUR.rate.replace(',','');
    const value = rate * dotenv.BITCOIN_AMOUNT;
    var valueWithCharge;

    if(value <= 10) {
      valueWithCharge = value - 0.99;
    }else if(value <= 25){
      valueWithCharge = value - 1.49;
    }else if (value <= 50){
      valueWithCharge = value - 1.99;
    }else if (value <= 200){
      valueWithCharge = value - 2.99;
    }else {
      valueWithCharge = value;
    }

    client.users.fetch(dotenv.USER_ID, false).then((user) => {
      const exampleEmbed = new Discord.MessageEmbed()
      .setColor('	#FFD700')
      .setThumbnail('https://www.antiquesandthearts.com/wp-content/uploads/2021/03/teaser_heritage_coins.jpg')
      .addField('Cena', `€${Math.round(rate * 100) / 100} • ${Math.round((((rate / dotenv.BUYING_RATE) - 1) * 100) * 100) / 100} %`, true)
      .addField('Hodnota', `€${Math.round(value * 100) / 100} • ${Math.round((((value / dotenv.BUYING_PRICE) - 1) * 100) * 100) / 100} %`, true)
      .addField('Hodnota s poplatkem', `€${Math.round(valueWithCharge * 100) / 100} • ${Math.round((((valueWithCharge / dotenv.BUYING_PRICE_WITH_FEE) - 1) * 100) * 100) / 100} %`, true)
      .setTimestamp();

      if (rate <= dotenv.LOWER_RATE){
        exampleEmbed.setColor("ff0000");
      } else if (rate > dotenv.LOWER_RATE && rate < dotenv.HIGHER_RATE){
        exampleEmbed.setColor("#FFA500");
      } else if (rate >= dotenv.HIGHER_RATE){
        exampleEmbed.setColor("#90ee90");
      }

      user.send(exampleEmbed);
    });
  } catch (error){
    console.error(error);
  }
}

// events
client.on('ready', () => {
  console.log("Logged as: " + client.user.tag);
  client.user.setActivity("BIG BROTHER IS WATCHING YOU", {type: "PLAYING"})
    .then(presence => console.log(`Activity set to: ${presence.activities[0].name}`))
    .catch(console.error);

  setInterval(async () => {
    sendData();
  },dotenv.REFRESH_TIME_MINUTES * 60 * 1000);
});

client.on("message", async msg => {
  if(msg.content == "init") {
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Okamžité informace')
      .setDescription('✍️ pro informace')
      .setThumbnail('https://www.antiquesandthearts.com/wp-content/uploads/2021/03/teaser_heritage_coins.jpg')

    msg.channel.send(exampleEmbed);
  }

  if(msg.author.username + "#" + msg.author.discriminator == client.user.tag && msg.embeds[0].title == "Okamžité informace") {
    msg.react('✍️');
  }

  if(msg.author.username + "#" + msg.author.discriminator == client.user.tag) return;
})

client.on("messageReactionAdd", function(messageReaction, user){
  if(user.username + "#" + user.discriminator == client.user.tag) return;
  
  if(messageReaction.emoji.name == "✍️") {
    sendData();
  }
});

// start bot
client.login(dotenv.TOKEN);