const mongoose = require('mongoose');
const { MONGODB_URL } = require('../../config');

//Conectar a la base de datos
const connection = async() =>{
    try {
        await mongoose.connect(MONGODB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Base de datos conectada!');
    } catch (error) {
        console.log(error);
        throw new Error('Error al conectar a la base de datos!!!');
    }
}

module.exports =  connection;