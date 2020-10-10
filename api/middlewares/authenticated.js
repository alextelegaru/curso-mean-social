'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret= 'clavesecretadelproyecto';


exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'la peticion no tiene la cabecera de autenticacion'});
    }

    //console.log(req.headers.authorization);

    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
    var payload = jwt.decode(token, secret);
    //console.log(payload);
    if(payload.ex <= moment().unix()){
        return res.status(401).send({
            message: 'token expirado'
        });
    }
    }catch(ex){
        return res.status(404).send({
            message: 'token no valido'
        });
    }

    req.user = payload;
    next();
    }

