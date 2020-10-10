'use strict'

var mongoosePaginate = require('mongoose-pagination');
var moment =require('moment');


var Message = require('../models/message.js');
var Follow = require('../models/follow.js');
var User = require('../models/user.js');
const message = require('../models/message.js');


function probando(req, res){
    res.status(200).send({
        message: "hola desde mensages"
    });
}


function saveMessage(req, res){
    var params=req.body;

    if(!params.text || !params.receiver  ) return res.status(200).send({message: "Envia los datos necesarios"});

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();

    message.save((err,messageStored) => {
        if(err) return res.status(500).send({message: "ERROR en la peticion"});
        if(!messageStored) return res.status(500).send({message: "ERROR al enviar el mensaje"});

        return res.status(200).send({message: messageStored});

    });
    


}





function getReceivedMessages(req,res){
    var userId = req.user.sub;

    var page=1;
    if(req.params.page){
        page=req.params.page;
    }

    var itemsPerPage=4;

    Message.find({receiver: userId}).populate('emitter','name image nick surname _id').paginate(page, itemsPerPage, (err,messages,total)=>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});

        if (!messages) return res.status(404).send({message: 'No hay mensajes'})

return res.status(200).send({
    total: total,
    pages: Math.ceil(total/itemsPerPage),
    messages
    
});
    });

}









function getEmittedMessages(req,res){
    var userId = req.user.sub;

    var page=1;
    if(req.params.page){
        page=req.params.page;
    }

    var itemsPerPage=4;

    Message.find({emitter: userId}).populate('emitter receiver','name image nick surname _id').paginate(page, itemsPerPage, (err,messages,total)=>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});

        if (!messages) return res.status(404).send({message: 'No hay mensajes'})

return res.status(200).send({
    total: total,
    pages: Math.ceil(total/itemsPerPage),
    messages
    
});
    });

}













module.exports={
    probando,
    saveMessage,
    getReceivedMessages,
    getEmittedMessages
}