const {conexion}= require("../connection/conexion");
const {Router} = require("express");
const fs=require("fs");
const path=require("path");
const router=Router();
router.delete("/",(req,res)=>{
    let nombre_de_archivo=req.body.para_eliminar;
    conexion.query(`delete from tablafiles where namefile="${nombre_de_archivo}";`,(err,results,fields)=>{
        if(err)throw err;
        // console.log(results);
        if(fs.existsSync(path.join(__dirname,"../files/"+nombre_de_archivo)))fs.unlinkSync(path.join(__dirname,"../files/"+nombre_de_archivo));
        console.log("eliminado");
        res.sendStatus(200);
    })
});
module.exports=router;