const mysql=require("mysql");
const conexion=mysql.createConnection({
    host:process.env.HOST,
    database:process.env.DATABASE,
    user:process.env.USER,
    password:process.env.PASSWORD
});
conexion.connect(function(error){
    if(error){
        throw error;
    }else{
        console.log('conexion EXITOSA');
    }
});
module.exports={
    conexion:conexion
}