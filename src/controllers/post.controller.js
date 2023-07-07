const Post = require('../models/post.model');
const fs = require('fs');
const path = require('path');
const { followUsersID } = require('../services/followUsersID');

//Guardar post
const savePost = async (req, res) => {
    try{
        //Recoger datos del body
        const params = req.body;

        //Si no hay texto ni archivo, devolver error
        if(!params.text){
            return res.status(400).json({
                status: "error",
                message: "Text is required",
            })
        }

        //Crear objeto post
        const post = new Post(params);
        post.user = req.user._id;

        //Guardar post en la base de datos
        const postStored = await post.save();

        if(!postStored){
            return res.status(500).json({
                status: "error",
                message: "Error saving post",
            })
        }

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Post saved successfully",
            post: postStored,
        })

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error saving post",
        })
    }
}

//Obtener un post
const getPost = async (req, res) => {
    try{
        //Recoger id de post
        const { id } = req.params;

        //Buscar post por id
        const post = await Post.findById(id);

        if(!post){
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            })
        }

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Post found successfully",
            post,
        })

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error getting post",
        })
    }
}

//Listar post de usuarios que sigue el usuario autenticado
const feed = async (req, res) => {
    try{
        //Buscar post de usuarios se obtiene el id del usuario que se pasa por parametro paginado y ordenado por fecha de creacion
        let page = req.params.page? parseInt(req.params.page) : 1;
        const itemsPerPage = 10;

        const myFollows = await followUsersID(req.user._id);

        const posts = await Post.find({ user: { $in: myFollows.following } }).sort({ datePosted: -1 }).populate('user', '-password -__v -role -email').paginate(page, itemsPerPage);

        //Contar total de post
        const totalPosts = await Post.countDocuments({ user: { $in: myFollows.following } });
        //Calcular total de paginas
        const totalPages = Math.ceil(totalPosts / itemsPerPage);

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Posts found successfully",
            page,
            itemsPerPage,
            totalPosts,
            totalPages,
            following: myFollows.following,
            posts
        })
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error getting posts",
        })
    }
}

//Listar post de un usuario
const getPostsByUser = async (req, res) => {
    try{
        //Recoger id de usuario
        const { id } = req.params;

        //Buscar post de usuarios se obtiene el id del usuario que se pasa por parametro paginado y ordenado por fecha de creacion
        let page = req.params.page? parseInt(req.params.page) : 1;
        const itemsPerPage = 5;


        const posts = await Post.find({ user: id }).sort({ datePosted: -1 }).populate('user', '-password -__v -role -email').paginate(page, itemsPerPage);

        //Contar total de post
        const totalPosts = await Post.countDocuments({ user: id });
        //Calcular total de paginas
        const totalPages = Math.ceil(totalPosts / itemsPerPage);

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Posts found successfully",
            page,
            itemsPerPage,
            totalPosts,
            totalPages,
            posts
        })

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error getting posts",
        })
    }
}

//Subir archivo
const uploadFile = async (req, res) => {
    try{
        //Recoger id de post
        const id  = req.params.id;

        //Buscar post por id
        const post = await Post.findOne({ _id: id, user: req.user._id});

        if(!post){
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            })
        }

        //Comprobar si existe archivo
        if(!req.file){
            return res.status(400).json({
                status: "error",
                message: "File is required",
            })
        }

        //Obtener nombre y extension del archivo
        const filePath = req.file.path;

        const fileSplit = filePath.split('\\');
        const fileName = fileSplit[2];
        const extensionSplit = fileName.split('\.');
        const fileExtension = extensionSplit[2];

        //Comprobar extension
        if(fileExtension !== 'png' && fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'gif'){
            fs.unlinkSync(filePath);
            return res.status(400).json({
                status: "error",
                message: "Invalid file extension",
            })
        }

        //Asignar nombre de archivo al post
        post.file = fileName;

        //Guardar post en la base de datos
        const postStored = await post.save();

        if(!postStored){
            return res.status(500).json({
                status: "error",
                message: "Error saving post",
            })
        }

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Post saved successfully",
            post: postStored,
        })
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error saving post",
        })
    }
}

//Obtener archivo
const getFile = async (req, res) => {
    try{
        //Recoger nombre de archivo
        const { filename } = req.params;

        //Comprobar si existe archivo
        const filePath = './uploads/posts/' + filename;
        
        if(!fs.existsSync(filePath)){
            return res.status(404).json({
                status: "error",
                message: "File not found",
            })
        }

        //Devolver archivo
        return res.sendFile(path.resolve(filePath));

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error getting file",
        })   
    }   
}

//Eliminar post
const deletePost = async (req, res) => {
    try{
        //Recoger id de post
        const id  = req.params.id;

        //Buscar post por id
        const post = await Post.findOne({ _id: id, user: req.user._id});

        if(!post){
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            })
        }

        //Eliminar post
        await post.deleteOne({ _id: id, user: req.user._id});

        //Devolver respuesta
        return res.status(200).json({
            status: "ok",
            message: "Post deleted successfully",
        })

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error deleting post",
            error
        })
    }
}

module.exports = { 
    savePost,
    getPost,
    feed,
    getPostsByUser,
    deletePost,
    uploadFile,
    getFile
};