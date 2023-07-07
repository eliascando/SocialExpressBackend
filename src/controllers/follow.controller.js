const Follow = require('../models/follow.model');

const saveFollow = async (req, res) => {
    //Obtener los datos de la petición
    const params = req.body;
    const user = req.user;

    //Crear el objeto de follow
    const userToFollow = new Follow({
        user: user._id,
        followed: params.followed
    });

    console.log(userToFollow);
    //Guardar los datos del follow en la base de datos
    await userToFollow.save();

    if(userToFollow.user == userToFollow.followed){
        return res.status(400).json({
            status: 'error',
            message: 'An error occurred while saving the follow'
        });
    }

    //Responder al cliente
    return res.status(200).json({
        status: 'ok', 
        message: 'Follow saved successfully',
        userToFollow
    });
}

const deleteFollow = async (req, res) => {
    try{
        //Obtener los datos de la petición
        const userId = req.user._id;

        //Obtener el id del follow a eliminar
        const followedId = req.params.id;

        //Eliminar el follow de la base de datos
        await Follow.findOneAndDelete({user: userId, followed: followedId});

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            message: 'Follow deleted successfully',
            Follow
        });
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the follow'
        });
    }
}

const following = async (req, res) => {
    try{
        //Obtener el id del usuario autenticado o el id del usuario que se pasa por parámetro
        if(req.params.id){
            var userId = req.params.id;
        }else{
            var userId = req.user._id;
        }
        //Obtener la pagina si se pasa por parámetro
        const page = req.params.page ? req.params.page : 1;
        const itemsPerPage = 5;

        //Obtener los usuarios que sigue el usuario y la paginación
        const following = await Follow.find({user: userId}, {populate: 'followed', page, limit: itemsPerPage});

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            message: 'Follows obtained successfully',
            following
        });
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while obtaining the follows'
        });
    }
}

const followers = async (req, res) => {
    try{
        //Obtener el id del usuario autenticado o el id del usuario que se pasa por parámetro
        if(req.params.id){
            var userId = req.params.id;
        }else{
            var userId = req.user._id;
        }

        //Obtener la pagina si se pasa por parámetro
        const page = req.params.page ? req.params.page : 1;
        const itemsPerPage = 5;

        //Obtener los usuarios que siguen al usuario y la paginación
        const followers = await Follow.find({user: userId}, {populate: 'followers', page, limit: itemsPerPage});
        //Sacar los usuarios que siguen al usuario autenticado
        

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            message: 'Followers obtained successfully',
            userId,
            followers
        });
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while obtaining the followers'
        });
    }
}

module.exports = { 
    saveFollow,
    deleteFollow,
    following,
    followers
};