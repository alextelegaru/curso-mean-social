'use strict'
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');



var User = require('../models/user.js');

var Follow = require('../models/follow');

var Publication = require('../models/publication');

const follow = require('../models/follow');


function home(req, res) {
    res.status(200).send({
        message: 'accion desde user'
    });
}



function pruebas(req, res) {
    res.status(200).send({
        message: 'accion de pruebas'
    });
}



function saveUser(req, res) {
    var params = req.body;
    var user = new User();


    if (params.name && params.surname &&
        params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;




        //controlar usuarios duplicados
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'error en la peticion de usuarios' });

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intenta registrar ya existe' });
            } {




                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'error guardar usuario' });
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'no se ha relistrado el usuario' });
                        }

                    });
                });





            }

        });







    } else {
        res.status(200).send({
            message: 'envia todos los campos necesario!!!'
        });

    }


}







//login 
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {

        if (err) return status(500).send({ message: 'Error en la peticion' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //devolver datos de usuario

                    if (params.gettoken) {
                        //generar y devolver token

                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }


                } else {
                    return res.status(404).send({ message: 'el usuario no se pudo identificar' });
                }
            });
        } else {
            return res.status(404).send({ message: 'el usuario no se pudo identificarxx' });

        }

    });


}


function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' });

        if (!user) return res.status(404).send({ message: 'usuario no existe' });


        /*
            followThisUser(req.user.sub,userId).then((value) =>{
            console.log(value);
                //user.password=undefined;
                return res.status(200).send({user,
                    following:value.following,
                  //  followed:value.followed
                });
          
            });*/









        Follow.findOne({ "user": req.user.sub, "followed": userId }).exec((err, following) => {
            //  return res.status(200).send({user,follow});

            Follow.findOne({ "user": userId, "followed": req.user.sub }).exec((err, followed) => {
                user.password = undefined;
                return res.status(200).send({ user, following, followed });




            });


        });


    });
}






async function followThisUser(identity_user_id, user_id) {

    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec((err, follow) => {
        if (err) return handleError(err);
        //console.log(follow);
        return follow;

    });



    /*
        var followed =await Follow.findOne({ "user": user_id,"followed":identity_user_id }).exec((err,follow)=> {
            if (err) return handleError(err);
               return follow;
        });*/


    return {
        following: following,
        // followed: followed

    }
}







//devolver un listado de usuarios paginado

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;



    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {

        if (err) return res.status(500).send({ message: 'error en la peticion' });


        if (!users) return res.status(404).send({ message: 'no hay usuarios disponibles' });





        Follow.find({ "user": identity_user_id }).select({ '_id': 0, '_v': 0, 'user': 0 }).exec(function (err, follows) {
            var follows_clean = [];

            follows.forEach((follow) => {
                follows_clean.push(follow.followed);
                //console.log(follows_clean);
            });



            Follow.find({ "followed": identity_user_id }).select({ '_id': 0, '_v': 0, 'followed': 0 }).exec(function (err, follows) {
                var followed_clean = [];

                follows.forEach((follow) => {
                    followed_clean.push(follow.user);

                });


                return res.status(200).send({
                    users,
                    users_following: follows_clean,
                    users_follow_me: followed_clean,
                    total,
                    pages: Math.ceil(total / itemsPerPage)



                });




            });




























        });










        /*
                followUserIds(identity_user_id).then((value) => {
                    
                    return res.status(200).send({
                        users,
                        users_following:value.following,
                        users_follow_me:value.followed,
                        total,
                        pages: Math.ceil(total/itemsPerPage)
                    });
        
        
                });
        
        */


    });








}



function getCounters5(req, res) {

    /*
getCountFollow("5f75cef89b9e0c1b48c42927").then((value) =>{

    return res.status(200).send(value.following);

});*/








    /*
    
        getFile("package-lock.json").then((value) =>{
    
        return res.status(200).send(value);
    
    })
    
    */
    /*
    
     myFunction().then((value) =>{
        console.log(value);
            //user.password=undefined;
           
      
        });
    */





}




async function getCounters(req, res) {

    var user_id = req.user.sub;
    if (req.params.id) {
        user_id = req.params.id;
    }
    getCountFollow(user_id).then((value) => {

        return res.status(200).send({
            following: value.following,
            followed: value.followed,
            publications: value.publications
        });
    })
}



async function getCountFollow(user_id) {

    var following = await new Promise((resolve, reject) => {

        Follow.countDocuments({ "user": user_id }).exec((err, following) => {
            if (err) {
                reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return        // and we don't want to go any further
            }
            resolve(following)
        })
    })

    var followed = await new Promise((resolve, reject) => {

        Follow.countDocuments({ "followed": user_id }).exec((err, followed) => {
            if (err) {
                reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return        // and we don't want to go any further
            }
            resolve(followed)
        })
    })

    var publications = await new Promise((resolve, reject) => {

        Publication.countDocuments({ "user": user_id }).exec((err, publications) => {
            if (err) {
                reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return        // and we don't want to go any further
            }
            resolve(publications)
        })
    })


    return {
        following: following,
        followed: followed,
        publications: publications
    }


}




























async function followUserIds(user_id) {


    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '_v': 0, 'user': 0 }).exec(function (err, follows) {
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
            //console.log(follows_clean);
        });
        //console.log(follows_clean);
        return follows_clean;
    });



    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '_v': 0, 'followed': 0 }).exec(function (err, follows) {
        var followed_clean = [];

        follows.forEach((follow) => {
            followed_clean.push(follow.user);
            console.log(followed_clean);
        });
        return followed_clean;
    });

    return { following: following, followed: followed };



}









//EDICION DE DATOS DE USUARIO

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    // delete update.password;




    bcrypt.hash(update.password, null, null, (err, hash) => {
        update.password = hash;



        if (userId != req.user.sub) {
            return res.status(500).send({ message: 'no tienes permiso para cambiar los datos' });
        }

        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: 'error en la peticion' });
            if (!userUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el usuario' });
            userUpdated.password = null;
            delete userUpdated.password // no la borra asi que a null mejor
            return res.status(200).send({ user: userUpdated });
        });




    });
















}



function uploadImage(req, res) {
    var userId = req.params.id;



    if (req.files) {
        var file_path = req.files.image.path;
        //console.log(file_path);
        var file_split = file_path.split('\\');
        //console.log(file_split);
        var file_name = file_split[2];
        //console.log(file_name);
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];



        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'no tienes permiso para cambiar los datos');

        }


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //actualizar documento de usuario logueado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'error en la peticion' });
                if (!userUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el usuario' });

                return res.status(200).send({ user: userUpdated });
            });


        } else {
            return removeFilesOfUploads(res, file_path, 'extension no valida');
        }

    } else {
        return res.status(200).send({ message: 'no se ha subido nada' });
    }
}


function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });

}







function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen...' });
        }
    });
}





module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    getCounters,
    uploadImage,
    getImageFile

}