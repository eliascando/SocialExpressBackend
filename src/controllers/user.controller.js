const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const Post = require('../models/post.model');
const bcrypt = require('bcrypt');
const { createToken } = require('../services/jwt');
const paginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const { followThisUser, followUsersID }= require('../services/followUsersID');

const register = async (req, res) => {
    //Obtener los datos de la petición
    let params = req.body;
    
    //Validar los datos del usuario
    if(params.password && params.email && params.username && params.name && params.lastname){
        let user = await User.findOne({$or: [
            {email: params.email.toLowerCase()},
            {username: params.username.toLowerCase()}
        ]});
        if(user){
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }
    }else{
        return res.status(400).json({
            status: 'error',
            message: 'Missing required data'
        });
    }

    //Crear el objeto de usuario
    let user = new User(params);

    //Encriptar la contraseña
    user.password = await bcrypt.hash(params.password, 10);

    //Guardar los datos del usuario en la base de datos
    await user.save();

    if(!user._id){
        return res.status(400).json({
            status: 'error',
            message: 'An error occurred while saving the user'
        });
    }

    //Responder al cliente
    return res.status(200).json({
        status: 'ok', 
        message: 'User registered successfully',
        user
    });
}

const login = async (req, res) => {
    //Obtener los datos de la petición y validar
    let params = req.body;

    if(!params.password || !params.email){
        return res.status(400).json({
            status: 'error',
            message: 'Missing required data'
        });
    }

    //Buscar el usuario en la base de datos
    let user = await User.findOne({$or: [
        {email: params.email.toLowerCase()}
    ]});

    if(!user){
        return res.status(404).json({
            status: 'error',
            message: 'Username or email not found'
        });
    }

    //Comprobar la contraseña
    let isMatch = await bcrypt.compare(params.password, user.password);

    if(!isMatch){
        return res.status(400).json({
            status: 'error',
            message: 'Invalid credentials'
        });
    }

    //Generar el token de autenticación
    const token = createToken(user);

    //Responder al cliente
    return res.status(200).json({
        status: 'ok',
        message: 'Login',
        user: {
            _id: user._id,
            name: user.name,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            date_joined: user.date_joined
        },
        token
    });
}

const profile = async (req, res) => {
    //Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //Buscar el usuario en la base de datos
    let user = await User.findById(id).select({password: 0, __v: 0, role: 0});

    if(!user){
        return res.status(404).json({
            status: 'error',
            message: 'User not found'
        });
    }

    //Incluir la información de follows y followers
    const followInfo = await followThisUser(req.user._id, id);

    //Responder al cliente
    return res.status(200).json({
        status: 'ok',
        message: 'User profile',
        user,
        following: followInfo.following,
        follower: followInfo.follower
    });
}

const list = async (req, res) => {
    //Controlar la paginación
    let page = 1;
    let itemsPerPage = 10;

    if(req.params.page){
        page = parseInt(req.params.page);
    }

    try{
        //Buscar los usuarios en la base de datos
        let users = await User.find().select({password: 0, __v: 0, role: 0, email: 0}).sort('_id').paginate(page, itemsPerPage);

        if(!users){
            return res.status(404).json({
                status: 'error',
                message: 'Users not found'
            });
        }

        //Obtener el total de usuarios
        let totalUsers = await User.countDocuments();

        let followUsers = await followUsersID(req.user._id);

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            page,
            itemsPerPage,
            totalUsers,
            totalPages: Math.ceil(totalUsers/itemsPerPage),
            users,
            users_following: followUsers.following,
            users_follow_me: followUsers.follower
        });
    }catch{
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while getting the users'
        });
    }
}

const update = async (req, res) => {
    //Obtener los datos de la petición
    let params = req.user;
    let userUpdate = req.body;

    //Eliminar propiedades innecesarias
    delete userUpdate.role;
    delete userUpdate.date_joined;
    try{
        let user = await User.findOne({$or: [
            {email: userUpdate.email.toLowerCase()},
            {username: userUpdate.username.toLowerCase()}
        ]});
    
        if(user && user._id != params._id){
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }
    
        //Si llega una contraseña nueva, encriptarla
        if(userUpdate.password){
            userUpdate.password = await bcrypt.hash(userUpdate.password, 10);
        }
    
        //Actualizar los datos del usuario en la base de datos
        let userUpdated = await User.findByIdAndUpdate({_id: params._id}, userUpdate, {new: true});
    
        if(!userUpdated){
            return res.status(400).json({
                status: 'error',
                message: 'An error occurred while updating the user'
            });
        }

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            message: 'User updated successfully',
            user: userUpdated,
        });
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating the user'
        });
    }
}

const uploadAvatar = async (req, res) => {
    try{
        //Recoger el fichero de la petición y comprobar que existe
        if(!req.file){
            return res.status(400).json({
                status: 'error',
                message: 'Missing file'
            });
        }

        //Consegir el nombre y la extensión del archivo
        let file_name = req.file.filename;
        let extension_split = file_name.split('\.');
        let file_ext = extension_split[1];
        let file_path = req.file.path;

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            //Borrar el archivo subido
            fs.unlinkSync(file_path);
            return res.status(400).json({
                status: 'error',
                message: 'Invalid file extension'
            });
        }
        
        //Buscar y actualizar el nombre de la imagen en la base de datos
        const userUpdated = await User.findByIdAndUpdate({_id: req.user._id}, { avatar: file_name }, { new: true });
  
        if (!userUpdated) {
            // Borrar el archivo subido
            fs.unlinkSync(file_path);
            return res.status(500).json({
                status: 'error',
                message: 'An error occurred while updating the user'
            });
        }
        
        // Responder al cliente
        return res.status(200).json({
            status: 'ok',
            message: 'Avatar uploaded successfully',
            user: userUpdated,
            file: req.file
        });
       
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while uploading the avatar'
        });
    }
}

const getAvatar = async (req, res) => {
    try{
        //Sacar el nombre del archivo enviado por la url
        const file = req.params.filename;
        console.log(file)

        //Definir el path de la imagen
        const path_file = `./uploads/avatar/${file}`;
        console.log(path_file);

        //Comprobar si existe el fichero
        fs.stat(path_file, (error,exists) => {
            if(!exists){
                return res.status(404).json({
                    status: 'error',
                    message: 'Avatar not found'
                });
            }
            
            //Responder al cliente
            return res.sendFile(path.resolve(path_file));
        });

    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while getting the avatar'
        });
    }
}

//funcion para obtener las estadisticas del usuario que se pasa por parametro
//seguidores, seguidos y publicaciones
const counters = async (req, res) => {
    let userId = null;
    if(req.params.id){
        userId = req.params.id;
    }else{
        userId = req.user._id;
    }

    try{
        //Obtener el total de seguidores
        let following = await Follow.countDocuments({user: userId});

        //Obtener el total de seguidos
        let followers = await Follow.countDocuments({followed: userId});

        //Obtener el total de publicaciones
        let posts = await Post.countDocuments({user: userId});

        //Responder al cliente
        return res.status(200).json({
            status: 'ok',
            id: userId,
            following,
            followers,
            posts
        });
    }catch(error){
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while getting the counters'
        });
    }
}

module.exports ={
    register,
    login,
    profile,
    list,
    update,
    uploadAvatar,
    getAvatar,
    counters
}