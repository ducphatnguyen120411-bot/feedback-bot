const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Gửi feedback / vouch")
    .addUserOption(o =>
      o.setName("user").setDescription("Người được vouch").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("star").setDescription("Số sao").setMinValue(1).setMaxValue(5).setRequired(true)
    )
    .addStringOption(o =>
      o.setName("message").setDescription("Nội dung").setRequired(true)
    );

  await client.application.commands.create(command);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "vouch") {
    const user = interaction.options.getUser("user");
    const star = interaction.options.getInteger("star");
    const message = interaction.options.getString("message");

    const embed = new EmbedBuilder()
      .setTitle("New Vouch | Cheap Supplier")
      .setColor(0x2ecc71)
      .addFields(
        { name: "Rating", value: "⭐".repeat(star) + ` (${star}/5)` },
        { name: "Vouch Message", value: message },
        { name: "Vouched By", value: `${interaction.user}` },
        { name: "Vouched For", value: `${user}` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
client.login(TOKEN);
