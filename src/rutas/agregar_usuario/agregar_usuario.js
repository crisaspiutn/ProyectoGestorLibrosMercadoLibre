const { Router } = require("express");
const {conexion} = require("../../connection/conexion");
const router=Router();
router.get("/",function(req,res){
    res.render("registro")
})
router.post("/",function(req,res){
    console.log(req.body);
    // console.log(req.headers);
    // console.log(req.query);
    // consultar(`insert into tablausuarios(name,clave) values("${req.body.usuario}", "${req.body.clave}");`)
    console.log("-----------------------");
    console.log(req.body.usuario);
    siExisteUsuario(req.body.usuario,req.body.clave,res);
})
function siExisteUsuario(usuario,clave,res){// true es 1
    conexion.query(`select if(exists(select * from tablausuarios where name="${usuario}"),1,0)`,function(error,results,fields){
        if(error){console.log('error sucedido');throw error;}
        // console.log(results);
        let lista_nombres=Object.values(results[0]);
        // console.log(lista_nombres[0]);
        // conexion.end();
        lista_nombres.forEach(element => {
            if(element!=null){
                console.log(element);
                if (element==0) {// 0 falso
                    console.log("no existe");
                    // console.log(usuario);
                    // console.log(clave);
                    consultar(`insert into tablausuarios(name,clave) values("${usuario}", "${clave}")`);
                    res.render("registro",{
                        mensaje:"registrado con exito, inicie sesion",estado:true
                    })
                }
                else{
                    console.log("si existe");
                    res.render("registro",{
                        mensaje:"el nombre de usuario ya esta ocupado",estado:false
                    })
                }
            }
            else {
                console.log("HABIA UN NULL");
                res.render("registro",{
                    mensaje:"el nombre de usuario ya esta ocupado"
                })
            }
        });
    });   
}
function consultar(consulta){
    conexion.query(consulta,function(error,results,fields){
        if(error){
            console.log('error sucedido');
            throw error;
        }
        // console.log("results");
        console.log(results);// devuelve tipo lista
        console.log("results------------");
        // lista_nombres=Object.keys(results[0]);
        // console.log(lista_nombres);
        // results.forEach(element => {
        //     if(element!=null)
        //     console.log(element);
        //     else console.log("HABIA UN NULL");
        // });
    }
    );
}
module.exports=router;