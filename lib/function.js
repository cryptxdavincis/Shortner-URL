const fs = require("fs");

function readDatabase() {
    try {
        if (!fs.existsSync(process.env.DB_FILE)) return { urls: [] };
        const data = fs.readFileSync(process.env.DB_FILE, 'utf8');
        return JSON.parse(data) || { urls: [] };
    } catch (error) {
        console.error("Error membaca database:", error);
        return { urls: [] };
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(process.env.DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error menulis database:", error);
    }
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function generateShortCode() {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 6);
}

module.exports = {
  readDatabase,
  writeDatabase,
  isValidUrl,
  generateShortCode
}