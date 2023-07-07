const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    biography: { type: String, trim: true, default: '' },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, trim: true, required: true },
    role: { type: String, trim: true, default: 'user' },
    avatar: { type: String, trim: true, default: 'userDefault.png' },
    date_joined: { type: Date, default: Date.now }
});

module.exports = model('User', UserSchema, 'users');