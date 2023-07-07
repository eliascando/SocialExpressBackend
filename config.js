const {config} = require('dotenv');
config();

module.exports = {
    PORT: process.env.PORT || 4000,
    MONGODB_URL: process.env.MONGODB_URL || '',
    SECRET_KEY: process.env.SECRET_KEY || ''
}