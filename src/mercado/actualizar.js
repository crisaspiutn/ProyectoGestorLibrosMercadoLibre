const fs = require('fs');
const fetch = require('node-fetch');
const chalk=require("chalk");
const credencial_estatica = require("../base/credencial_estatica");
const estadistica = require("./../mercado/estadistica");
const util = require('util');
const sleep = util.promisify(setTimeout);

function trunc (x, posiciones = 0) {
    var s = x.toString()
    var l = s.length
    var decimalLength = s.indexOf('.') + 1
    var numStr = s.substr(0, decimalLength + posiciones)
    return Number(numStr)
  }
function precio_modificado(publicacion_de_base_de_datos) {
    let precio_como_texto = publicacion_de_base_de_datos.precio.toString();
    console.log("precio en la base de datos: "+precio_como_texto);
    let precio_cortando_decimales = precio_como_texto.split(",");
    let precio_sin_decimales = precio_cortando_decimales[0];
    let nuevo_precio_cortado_en_numero = Number(precio_sin_decimales);

    // let numero=Number(publicacion_de_base_de_datos.precio)*99/100;
    let numero = Number(nuevo_precio_cortado_en_numero) * 98 / 100;
    // console.log("precio: "+publicacion_de_base_de_datos.precio+"  con -1%: "+Number(publicacion_de_base_de_datos.precio)*99/100+" "+numero);
    if (numero > 1000) {
        console.log("precio: " + publicacion_de_base_de_datos.precio + "  con -2%: " + Number(publicacion_de_base_de_datos.precio) * 99 / 100 + " = " + numero);
        console.log("el precio es mayor a",1000, "entonces se le pondra: ",numero.toFixed(2));
        // return Number(publicacion_de_base_de_datos.precio)*99/100;
        return numero.toFixed(2);
    } else {
        console.log("como si es menor. se pondra:",1000);
        return 1000;
    }
}
// function sleep(milliseconds) {
//     var start = new Date().getTime();
//     for (var i = 0; i < 1e7; i++) {
//         if ((new Date().getTime() - start) > milliseconds) {
//             break;
//         }
//     }
// }

async function pausar_publicacion(publicacion_de_mercado_libre, usuario_segun_token) {
    console.log(chalk.green("--------------------------pausar_publicacion | INICIO -----------------------------------"))
    let funciono_correctamente = false;
    let contar_fallas = 0;
    console.log(chalk.red("------------------------publicacion_de_mercado_libre-------------------------------------"))
    console.log((publicacion_de_mercado_libre))
    console.log(chalk.red("------------------------publicacion_de_mercado_libre-------------------------------------"))
    // while (!funciono_correctamente && contar_fallas < 3) {
    while (!funciono_correctamente) {
        try {
            // console.log(chalk.blue("datos de lo que quiero actualizar"));
            console.log("################################  datos de lo que quiero actualizar ################################");
            // console.log(chalk.blue(publicacion_de_mercado_libre.id_ml));
            console.log("################################     "+publicacion_de_mercado_libre.id_ml);
            await fetch('https://api.mercadolibre.com/items/' + publicacion_de_mercado_libre.id_ml, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + credencial_estatica.diccionario_credenciales[usuario_segun_token].access_token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    status: 'paused'
                })
            })
                .then(async x =>await x.json())
                .then(async dato => {
                    if ((dato.hasOwnProperty('title') == false)) {
                        console.log("--------------------------------------------------------------------no tenia titulo"+publicacion_de_mercado_libre.id_ml);
                        if(dato.hasOwnProperty('cause')){
                            let daraLista=dato.cause;
                            if (Object.prototype.toString.call(daraLista) === '[object Array]'){
                                for (let i = 0; i < daraLista.length; i++) {
                                    if(daraLista[i].code=='item.price.not_modifiable')console.log("no es modificable");
                                    funciono_correctamente = true;// no es que funcione pero lo pongo para que no frene
                                }
                            }
                            else throw new Error("mercado libre no entrego lista de errores pero si existe un error");
                        }
                        else console.log(dato);
                        console.log("--------------------------------------------------------------------no tenia titulo"+publicacion_de_mercado_libre.id_ml);
                        contar_fallas++;
                        await sleep(10);
                        console.log(chalk.blue(publicacion_de_mercado_libre.id_ml));
                        throw new Error("NO TENIA TITULO AL INTENTAR PAUSAR: "+contar_fallas);
                    } else {
                        estadistica.contar_actualizados++;
                        funciono_correctamente = true;
                    }
                });
        } catch (error) {
            console.log("falle-------------------------------------------------pausar_publicacion");
            contar_fallas++;
            console.log(error);
            console.log("falle-------------------------------------------------pausar_publicacion");
            await sleep(10);
        }
    }
    console.log(chalk.green("--------------------------pausar_publicacion | FIN -----------------------------------"))
}
async function actualizar_publicacion_precio_stock(publicacion_de_mercado_libre, publicacion_de_base_de_datos, usuario_segun_token) {
    console.log(chalk.bgWhite.black("----------------------------------------------------- INICIO"))
    let funciono_correctamente = false;
    let contar_fallas = 0;
    // while (!funciono_correctamente && contar_fallas < 3) {
    while (!funciono_correctamente) {
        let precio_que_pondre_rebajado = precio_modificado(publicacion_de_base_de_datos);
        try {
            await fetch('https://api.mercadolibre.com/items/' + publicacion_de_mercado_libre.id_ml, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + credencial_estatica.diccionario_credenciales[usuario_segun_token].access_token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    status: 'active',
                    available_quantity: publicacion_de_base_de_datos.stock, //  
                    price: precio_que_pondre_rebajado // 
                })
            })
                .then(x => x.json())
                .then( async dato => {
                    if ((dato.hasOwnProperty('title') == false)) {
                        console.log("-------------------------------------------------------------------------------no tenia titulo");
                        if(dato.hasOwnProperty('cause')){
                            let daraLista=dato.cause;
                            if (Object.prototype.toString.call(daraLista) === '[object Array]'){
                                for (let i = 0; i < daraLista.length; i++) {
                                    if(daraLista[i].code=='item.price.not_modifiable')console.log("no es modificable");
                                    funciono_correctamente = true;// no es que funcione pero lo pongo para que no frene
                                }
                            }
                            else throw new Error("mercado libre no entrego lista de errores pero si existe un error");
                        }
                        else console.log(dato);
                        console.log("-------------------------------------------------------------------------------no tenia titulo");
                        // console.log('algo salio mal por este precio: ', precio_que_pondre_rebajado);// borrar ya no es por el precio
                        await sleep(10);

                    } else {
                        estadistica.contar_actualizados++;
                        funciono_correctamente = true;
                    }
                });
        } catch (error) {
            console.log("falle-------------------------------------------------actualizar_publicacion_precio_stock");
            contar_fallas++;
            console.log('algo salio mal por este precio y ni respuesta tuve en dato creo: ', precio_que_pondre_rebajado);
            console.log(error);
            await sleep(10);
        }
    }
    console.log(chalk.bgWhite.black("----------------------------------------------------- FIN"))
}
module.exports = {
    pausar_publicacion: pausar_publicacion,
    actualizar_publicacion_precio_stock: actualizar_publicacion_precio_stock
};