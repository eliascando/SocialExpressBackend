const jwt = require('jwt-simple');
const moment = require('moment');
const { SECRET_KEY } = require('../../config');

const createToken = (user) => {
    const payload = {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        iat: moment().unix(),
        exp: moment().add(1, 'day').unix()
    }
    return jwt.encode(payload, SECRET_KEY);
}

module.exports = {
    createToken
}