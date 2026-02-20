const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// Load feedback
let feedback = {};
if (fs.existsSync("feedback.json")) {
  feedback = JSON.parse(fs.readFileSync("feedback.json"));
}

client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

  /* ===== /feedback ===== */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "feedback") return;

    if (feedback[interaction.user.id]) {
      return interaction.reply({
        content: "❌ Bạn đã feedback rồi",
        ephemeral: true
      });
    }

    // Modal nhập tên đơn
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

  /* ===== SUBMIT MODAL ===== */
  if (interaction.isModalSubmit()) {
    if (interaction.customId !== "order_modal") return;

    const orderName = interaction.fields.getTextInputValue("order_name");

    // Lưu tạm tên đơn
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

  /* ===== CLICK STAR ===== */
  if (interaction.isButton()) {
    const userId = interaction.user.id;

    if (!feedback[userId] || feedback[userId].stars !== null) {
      return interaction.reply({
        content: "❌ Bạn đã feedback rồi",
        ephemeral: true
      });
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
