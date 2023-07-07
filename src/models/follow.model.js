const { Schema, model } = require('mongoose');

const FollowSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    followed: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dateFollowed: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Follow', FollowSchema, 'follows');