'use strict'

var mongoose=require('mongoose');

var app =require('./app');
var port = 3800;

//conexiones database
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social',{ useNewUrlParser: true })
.then(()=>{
    console.log('CONEXION EXITOSA BASE DE DATOS');

    //crear servidor

    app.listen(port,()=>{
        console.log("servidor corriendo en http 3800");
    });



})
.catch(err => console.log(err)); 