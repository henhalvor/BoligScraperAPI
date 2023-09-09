const express = require("express");
const { runRealEstateScraper } = require('./realEstateScraper');
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

app.get("/", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required.' });
    }

    try {
        const data = await runRealEstateScraper(url);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while scraping the data.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});