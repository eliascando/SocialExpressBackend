const jwt = require('jwt-simple');
const moment = require('moment');
const { SECRET_KEY } = require('../../config');

const auth = (req, res, next) => {
    //Comprobar si llega la cabecera de autorización
    if(!req.headers.authorization){
        return res.status(403).json({
            status: 'unauthorized',
            message: 'Missing authorization header'
        });
    }

    //Limpiar el token y quitar comillas
    let token = req.headers.authorization.replace(/['"]+/g, '');

    //Decodificar el token
    try {
        var payload = jwt.decode(token, SECRET_KEY);
        //Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){
            return res.status(403).json({
                status: 'unauthorized',
                message: 'Expired token'
            });
        }
        req.user = payload;
    } catch (error) {
        return res.status(403).json({
            status: 'unauthorized',
            message: 'Invalid token'
        });
    }

    //Pasar a la acción
    next();   
}

module.exports = auth;