const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const serverless = require('serverless-http'); // Tambahkan ini
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Endpoint validasi (Pastikan jalurnya sesuai dengan routing Netlify nanti)
app.post('/api/validate', async (req, res) => {
    const { words, userSentence } = req.body;

    const prompt = `
        Tugas: Validasi kalimat Bahasa Jepang.
        Kata wajib digunakan: ${words.join(", ")}.
        Kalimat User: "${userSentence}"

        Berikan respon HANYA dalam format JSON mentah seperti ini:
        {
          "is_correct": true,
          "correction": "kalimat yang benar",
          "explanation": "penjelasan dalam Bahasa Indonesia"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error("Error Detail:", error);
        res.status(500).json({ error: "Gagal memproses validasi", detail: error.message });
    }
});

// PENTING: Netlify tidak menggunakan app.listen()
// Kita ekspor handler untuk serverless
module.exports.handler = serverless(app);
