import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const BOT_ID = new mongoose.Types.ObjectId("000000000000000000000001");
const BOT_EMAIL = "nova@bot.internal";
const BOT_NAME = "Nova";

const BOT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#7c3aed"/>
      <rect x="28" y="38" width="44" height="34" rx="10" fill="white"/>
      <circle cx="41" cy="55" r="6" fill="#7c3aed"/>
      <circle cx="59" cy="55" r="6" fill="#7c3aed"/>
      <rect x="47" y="20" width="6" height="14" rx="3" fill="white"/>
      <circle cx="50" cy="18" r="5" fill="white"/>
    </svg>
  `);

export async function ensureBotUser() {
  const existing = await User.findById(BOT_ID);
  if (existing) return existing;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new mongoose.Types.ObjectId().toString(), salt);

  const bot = new User({
    _id: BOT_ID,
    fullName: BOT_NAME,
    email: BOT_EMAIL,
    password: hashedPassword,
    profilePic: BOT_AVATAR,
    isBot: true,
  });

  await bot.save();
  console.log("AI bot user created:", BOT_NAME);
  return bot;
}

export async function getAIReply(history) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "Gemini API key is missing.";
  }

  const prompt = `
You are Nova, a friendly AI assistant inside a chat application.

Reply naturally like a real person.
Keep responses concise.

Conversation:

${history
  .filter((m) => m.text)
  .map((m) => {
    const role =
      m.senderId.toString() === BOT_ID.toString()
        ? "Nova"
        : "User";

    return `${role}: ${m.text}`;
  })
  .join("\n")}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      return "Gemini returned an error.";
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response."
    );
  } catch (err) {
    console.error(err);
    return "Error contacting Gemini.";
  }
}
