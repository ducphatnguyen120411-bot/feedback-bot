console.log("TOKEN:", process.env.TOKEN ? "OK" : "MISSING");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// Load feedback
let feedback = {};
if (fs.existsSync("feedback.json")) {
  feedback = JSON.parse(fs.readFileSync("feedback.json", "utf8"));
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {

  // /feedback
  if (interaction.isChatInputCommand() && interaction.commandName === "feedback") {
    if (feedback[interaction.user.id]?.stars) {
      return interaction.reply({ content: "❌ Bạn đã feedback rồi", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId("order_modal")
      .setTitle("Feedback đơn hàng");

    const orderInput = new TextInputBuilder()
      .setCustomId("order_name")
      .setLabel("Tên đơn hàng")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(orderInput)
    );

    return interaction.showModal(modal);
  }

  // Submit modal
  if (interaction.isModalSubmit() && interaction.customId === "order_modal") {
    const orderName = interaction.fields.getTextInputValue("order_name");

    feedback[interaction.user.id] = {
      order: orderName,
      stars: null,
      time: null
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("star_1").setLabel("⭐").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("star_2").setLabel("⭐⭐").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("star_3").setLabel("⭐⭐⭐").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("star_4").setLabel("⭐⭐⭐⭐").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("star_5").setLabel("⭐⭐⭐⭐⭐").setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content: `🧾 **Đơn hàng:** ${orderName}\n⭐ Chọn số sao:`,
      components: [row],
      ephemeral: true
    });
  }

  // Click star
  if (interaction.isButton()) {
    const userId = interaction.user.id;
    if (!feedback[userId] || feedback[userId].stars !== null) {
      return interaction.reply({ content: "❌ Bạn đã feedback rồi", ephemeral: true });
    }

    const stars = Number(interaction.customId.split("_")[1]);
    feedback[userId].stars = stars;
    feedback[userId].time = new Date().toISOString();

    fs.writeFileSync("feedback.json", JSON.stringify(feedback, null, 2));

    return interaction.reply({
      content: `✅ Đã ghi nhận **${stars}⭐** cho đơn **${feedback[userId].order}**`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
