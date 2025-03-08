const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const {
  readDatabase,
  writeDatabase,
  isValidUrl,
  generateShortCode
} = require("../lib/function");

const router = express.Router();
const DB_FILE = "database.json";

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Terlalu banyak permintaan, coba lagi nanti" }
});
router.use(limiter);
router.use((req, res, next) => {
    req.BASE_URL = `${req.protocol}://${req.get('host')}`;
    next();
});

let urlMap = new Map();
function loadCache() {
    const db = readDatabase();
    urlMap = new Map(db.urls.map(entry => [entry.shortCode, entry.longUrl]));
}
loadCache();

router.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) return res.status(400).json({ error: "URL tidak boleh kosong" });
    if (!isValidUrl(longUrl)) return res.status(400).json({ error: "URL tidak valid" });

    const db = readDatabase();
    
    const existingEntry = db.urls.find(url => url.longUrl === longUrl);
    if (existingEntry) {
        return res.json({ shortUrl: `${req.BASE_URL}/${existingEntry.shortCode}` });
    }

    const shortCode = generateShortCode();
    db.urls.push({ shortCode, longUrl });
    writeDatabase(db);
    urlMap.set(shortCode, longUrl);

    res.json({ shortUrl: `${req.BASE_URL}/${shortCode}` });
});

router.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    if (urlMap.has(shortCode)) {
        return res.redirect(urlMap.get(shortCode));
    }

    res.status(404).json({ error: "URL tidak ditemukan" });
});

router.delete('/delete/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    let db = readDatabase();
    const index = db.urls.findIndex(url => url.shortCode === shortCode);
    
    if (index === -1) return res.status(404).json({ error: "URL tidak ditemukan" });

    db.urls.splice(index, 1);
    writeDatabase(db);
    urlMap.delete(shortCode);

    res.json({ message: "URL berhasil dihapus" });
});

module.exports = router;