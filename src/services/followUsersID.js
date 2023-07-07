const Follow = require('../models/follow.model');

const followUsersID = async (identityUserID) => {
    try{
        let following = await Follow.find({user: identityUserID}).select({'followed':1,  "_id":0});
        let follower = await Follow.find({followed: identityUserID}).select({'user':1,  "_id":0});

        let following_clean = [];
        let follower_clean = [];

        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });

        follower.forEach((follow) => {
            follower_clean.push(follow.user);
        });

        return {
            following: following_clean,
            follower: follower_clean
        }
    }catch(error){
        return {};
    }
}

const followThisUser = async (identityUserID, userID) => {
    try{
        let following = await Follow.findOne({user: identityUserID, followed: userID});
        let follower = await Follow.findOne({user: userID, followed: identityUserID});

        return {
            following,
            follower
        }
    }catch(error){
        return {},
        error
    }
}

module.exports = {
    followUsersID,
    followThisUser
}   