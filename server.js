import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const HF_API_URL =
  "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

app.post("/ai/hugeface", async (req, res) => {
  try {
    const prompt = req.body.message || req.body.prompt || "";
    const apiKey = process.env.HF_TOKEN;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "HF_TOKEN not set in environment" });
    }

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    const data = await response.json();

    const text =
      (Array.isArray(data) && data[0]?.generated_text) ||
      data?.generated_text ||
      JSON.stringify(data);

    res.json({
      choices: [
        {
          message: { role: "assistant", content: text },
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server berjalan di port " + PORT));
