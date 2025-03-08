require('dotenv').config();
const express = require('express');
const morgan = require("morgan");
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'production') {
    const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: logStream }));
} else {
    app.use(morgan('dev'));
}

app.use(bodyParser.json());

app.use('/', pageRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));