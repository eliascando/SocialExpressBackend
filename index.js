//Importar dependencias
const express = require('express');
const cors = require('cors');
const  connection  = require('./src/database/connection');
const { PORT } = require('./config');

//Conexion a la base de datos
connection();

//Crear servidor node con express
const app = express();

//Configurar el cors y el servidor
app.use(cors());

//Convertir los datos que llegan a json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Cargar las rutas
app.use('/api/follow', require('./src/routes/follow.routes'));
app.use('/api/post', require('./src/routes/post.routes'));
app.use('/api/user', require('./src/routes/user.routes'));

//Ruta de consulta de estado del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({status: 'ok', message: 'Server is running'});
});

//Poner el servidor a escuchar 
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});