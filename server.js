const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gunakan nama model yang lebih spesifik jika flash saja gagal
// Gunakan salah satu nama yang ada di daftar tadi
// Saya sarankan "gemini-2.5-flash" untuk performa terbaik di tahun 2026 ini
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


// Tambahkan pengecekan error yang lebih detail
app.post('/api/validate', async (req, res) => {
    const { words, userSentence } = req.body;

    // Prompt diperkuat agar AI tidak memberikan teks tambahan selain JSON
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
        
        // Membersihkan markdown ```json jika ada
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        
        console.log("Respon AI:", cleanedJson); // Untuk memantau di terminal
        res.json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error("Error Detail:", error);
        res.status(500).json({ error: "Gagal memproses validasi", detail: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
