const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

const DATA_FILE = "./feedback.json";

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "feedback") {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));

    if (data[interaction.user.id]) {
      return interaction.reply({
        content: "❌ Bạn đã feedback rồi",
        ephemeral: true
      });
    }

    data[interaction.user.id] = {
      stars: 5,
      time: new Date().toISOString()
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    interaction.reply("✅ Feedback đã được ghi nhận");
  }
});

client.login(process.env.TOKEN);
