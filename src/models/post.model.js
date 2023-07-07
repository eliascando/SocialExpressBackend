const { Schema, model } = require('mongoose');

const postSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    file: String,
    datePosted: { type: Date, default: Date.now }
});

module.exports = model('Post', postSchema, 'posts');