const mysql = require("mysql");
require("dotenv").config();
// const conexion = require("../connection/conexion");
class Connection{
    // constructor(){}
    static conexion;
    static async iniciarConexionConLaBaseDeDatos(datosDeBaseDeDatos){
        try {
            Connection.conexion=await mysql.createConnection(datosDeBaseDeDatos);
        } catch (error) {
        }
    }
    // static async conectar(xconexion){
    //     return xconexion=await mysql.createConnection({
    //         host:process.env.HOST,
    //         database:process.env.DATABASE,
    //         user:process.env.USER,
    //         password:process.env.PASSWORD
    //     });
    // }
    static async verificaQueSeConectoBien(){
        // algo.connect(function(error){
        
            await Connection.conexion.connect(function(error){
                if(error){
                    console.log("typeof error");
                    console.log(typeof error);
                    throw error;
                }else{
                    return true;
                }
                
            });
      
    }
    // static async checkea_conexion(x_conexion){
    //     await x_conexion.connect(function(error){
    //         if(error){
    //             throw error;
    //         }else{
    //             return true;
    //         }
    //     });
    // }
}

module.exports=Connection