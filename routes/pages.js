const express = require('express');
const { readDatabase } = require("../lib/function");

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/docs', (req, res) => {
    res.render('docs');
});

router.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const db = readDatabase();
    const entry = db.urls.find(url => url.shortCode === shortCode);

    if (entry) {
        return res.redirect(entry.longUrl);
    }
    res.status(404).json({ error: "URL tidak ditemukan" });
});

module.exports = router;
