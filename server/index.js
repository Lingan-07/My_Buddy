import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Sentiment from "sentiment";
import axios from "axios";

dotenv.config();

const app = express();
const sentiment = new Sentiment();

app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.send("✅ MindMate backend (OpenRouter version) is running!");
});

// Analyze route
app.post("/analyze", async (req, res) => {
  const { journalText } = req.body;

  if (!journalText || typeof journalText !== "string") {
    return res.status(400).json({ error: "Invalid or missing journal text." });
  }

  const sentimentResult = sentiment.analyze(journalText);
  const sentimentScore = sentimentResult.score;

  const prompt = `Give motivational advice to someone who said: "${journalText}"`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a warm and supportive mental health assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173", // for OpenRouter usage tracking
        },
      }
    );

    const message =
      response.data?.choices?.[0]?.message?.content ||
      "You're doing amazing — one step at a time. Keep going!";

    res.json({
      sentimentScore,
      message,
    });
  } catch (error) {
    console.error("🔥 OpenRouter API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from OpenRouter." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MindMate server running on http://localhost:${PORT}`);
});
