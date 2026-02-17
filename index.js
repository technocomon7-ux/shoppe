const axios = require("axios");
const cheerio = require("cheerio");

const RESI = process.env.RESI;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function getTracking() {
  try {
    const { data } = await axios.get(
      `https://spx.co.id/m/track?${RESI}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const $ = cheerio.load(data);

    const status = $(".tracking-status .active").text().trim();
    const firstEvent = $(".tracking-item").first().text().trim();

    return { status, firstEvent };

  } catch (err) {
    console.log("Gagal ambil tracking:", err.message);
    return null;
  }
}

async function sendTelegram(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message
      }
    );
  } catch (err) {
    console.log("Gagal kirim Telegram:", err.message);
  }
}

async function checkAndSend() {
  if (!RESI || !BOT_TOKEN || !CHAT_ID) {
    console.log("ENV belum lengkap!");
    process.exit(1);
  }

  const result = await getTracking();

  if (!result) return;

  const msg = `
📦 Update Resi ${RESI}

Status: ${result.status}
Detail:
${result.firstEvent}
`;

  await sendTelegram(msg);
  console.log("Update terkirim");
}

// Langsung jalan
checkAndSend();
