const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const FEEDBACK_CHANNEL_ID = process.env.FEEDBACK_CHANNEL_ID;

let feedbackData = {};
if (fs.existsSync("./feedback.json")) {
  feedbackData = JSON.parse(fs.readFileSync("./feedback.json"));
}

client.once("ready", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("feedback")
      .setDescription("Đánh giá đơn hàng")
  ]);
});

client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand() && interaction.commandName === "feedback") {
    const modal = new ModalBuilder()
      .setCustomId("orderModal")
      .setTitle("Nhập mã đơn hàng");

    const orderInput = new TextInputBuilder()
      .setCustomId("orderId")
      .setLabel("Mã đơn hàng")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(orderInput));
    return interaction.showModal(modal);
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === "orderModal") {
    const orderId = interaction.fields.getTextInputValue("orderId");

    if (feedbackData[orderId]) {
      return interaction.reply({ content: "❌ Đơn này đã feedback!", ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      [1,2,3,4,5].map(s =>
        new ButtonBuilder()
          .setCustomId(`rate_${orderId}_${s}`)
          .setLabel("⭐".repeat(s))
          .setStyle(ButtonStyle.Primary)
      )
    );

    return interaction.reply({
      content: `📦 **Mã đơn:** ${orderId}\n👉 Chọn số sao:`,
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isButton()) {
    const [, orderId, star] = interaction.customId.split("_");

    if (feedbackData[orderId]) {
      return interaction.reply({ content: "❌ Đơn này đã feedback!", ephemeral: true });
    }

    feedbackData[orderId] = {
      user: interaction.user.id,
      rating: star,
      time: Date.now()
    };

    fs.writeFileSync("./feedback.json", JSON.stringify(feedbackData, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("⭐ Feedback đơn hàng")
      .setColor("Gold")
      .addFields(
        { name: "👤 Khách", value: `<@${interaction.user.id}>`, inline: true },
        { name: "📦 Mã đơn", value: orderId, inline: true },
        { name: "⭐ Sao", value: `${star}/5`, inline: true }
      )
      .setTimestamp();

    const channel = await client.channels.fetch(FEEDBACK_CHANNEL_ID);
    channel.send({ embeds: [embed] });

    return interaction.update({ content: "✅ Đã gửi feedback!", components: [] });
  }
});

client.login(TOKEN);
