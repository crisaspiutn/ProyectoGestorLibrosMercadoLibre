const fetch = require('node-fetch');
const estadistica=require('./estadistica');
const credencial_estatica =require("../base/credencial_estatica");
const util=require('util');
const fs = require('fs');
const path = require('path');
const sleep = util.promisify(setTimeout);
const axios = require("axios");
// const path=require('path');
// const {conexion}=require("../conexion/conexion")
const id = process.env.ID_API; // constantes cri 2
const key_secreto = process.env.KEY_SECRETO; // constantes cri 2

function insertCredencialToMysql(conexion, llave_usuario, credencial) {
    conexion.query(`insert into credenciales(usuario,access_token,user_id,refresh_token,fecha) values("${llave_usuario}","${credencial.access_token}",${credencial.user_id},"${credencial.refresh_token}",${credencial.fecha});`);
}
function reconocerFechaPorParametros(year, month, day, hour, minute, second) {
    let fecha_reconocida = new Date(year, month, day, hour, minute, second);
    // let new_fecha=new Date(fecha_reconocida.getTime()+21600000);// 1000 = 1s     // 1m = 60s = 60 000 mili
    console.log("fecha_reconocida");
    console.log(fecha_reconocida);
    let cifra=fecha_reconocida.getTime();
    return cifra;
}
async function getTablaCredenciales(funcionQuery) {
    try {
        const resultado_lista = await funcionQuery("select * from credenciales;");
        let diccionario_credenciales={};
        for (let i = 0; i < resultado_lista.length; i++) {
            diccionario_credenciales[resultado_lista[i].usuario] = resultado_lista[i];
            
        }
        return diccionario_credenciales;
    } catch (error) {
        if (error) throw error;
        return error;
    }
}

async function ejecutarCredenciales(conexion, lista_diccionario_credenciales) {
    // console.log("devolve()");
    let lista_llaves_de_diccionario=Object.keys(lista_diccionario_credenciales); 
    for (let i = 0; i < lista_llaves_de_diccionario.length; i++) {
        console.log("esta es la credencial que envio a ejecuta1Credencial()");
        console.log(lista_llaves_de_diccionario[i]);
        ejecuta1Credencial(lista_llaves_de_diccionario[i], conexion);
    }
}

function ejecuta1Credencial(usuario, conexion) {
    // let fecha_que_debe_actualizarse = una_credencial.fecha + 120000;//--------------------------------- aqui y abajo modifica la frecuencia
    // let fecha_que_debe_actualizarse=credencial_estatica.diccionario_credenciales[usuario].fecha+300000; // aqui 10 minutos
    let fecha_que_debe_actualizarse=credencial_estatica.diccionario_credenciales[usuario].fecha+21000000; // aqui modo produccion 5.8 horas
    console.log(new Date().getTime());
    console.log(fecha_que_debe_actualizarse);
    if (fecha_que_debe_actualizarse <= (new Date().getTime())) {
        console.log("-------------------------------------ya debio actualizarse");
        // conexion.query("update credenciales set fecha="+new Date().getTime()+" where fecha="+ultima_fecha+";")
        // actualizar(ultima_fecha)
        // let fecha_actual=new Date().getTime();
        ejecutarCada6Horas(usuario, conexion)
        console.log("listo ya esta actualizado");
    }
    else {
        // console.log("falta para que se actualice estos segundos:",(fecha_que_debe_actualizarse-new Date().getTime())/1000);
        setTimeout(() => {
            console.log("--------------se ejecutara recien luego de que YA espere");
            ejecutarCada6Horas(usuario, conexion)
        }, fecha_que_debe_actualizarse - new Date().getTime());
    }
}

function ejecutarCada6Horas(usuario, conexion) {
    actualizarCredencial(usuario, conexion)
    setTimeout(() => {
        console.log("actualizado correctamente!");
        ejecutarCada6Horas(usuario, conexion);
    // }, 300000);//--------------------------------- aqui 10 minutos
    }, 21000000);//--------------------------------- aqui modo produccion 5.8 horas
    // }, 120000);//--------------------------------- aqui y abajo modifica la frecuencia
}
function actualizarCredencial(usuario, conexion) {
    // const refresh_token=credencial['refresh_token'];
    console.log("credencial que le llega a actualizarCredencial() final"); // ---- para testear
    console.log(credencial_estatica.diccionario_credenciales[usuario]); // ---- para testear
    // console.log("-----"); // ---- para testear
    // console.log("id");
    // console.log(id);
    // console.log("key_secreto");
    // console.log(key_secreto);
    let fecha_actual = new Date().getTime();
    axios({
        method: 'POST',
        url: 'https://api.mercadolibre.com/oauth/token',
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        data: 
        {
            grant_type: "refresh_token",
            client_id: id,
            client_secret: key_secreto,
            refresh_token: credencial_estatica.diccionario_credenciales[usuario].refresh_token,
        }
        // JSON.stringify({
        //     grant_type: "refresh_token",
        //     client_id: id,
        //     client_secret: key_secreto,
        //     refresh_token: credencial_estatica.diccionario_credenciales[usuario].refresh_token,
        // })
    })
    // body: JSON.stringify({
    // })
    // .then(response => response.json())
    .then(respuesta => {
        console.log("respuesta de la funcion actualizarCredencial() final");
        const datos=respuesta.data;
        console.log(datos);
        if(datos.hasOwnProperty('refresh_token')&&datos.hasOwnProperty('access_token')) {
            conexion.query(`update credenciales set fecha=${fecha_actual},access_token="${datos.access_token}",refresh_token="${datos.refresh_token}" where fecha=${credencial_estatica.diccionario_credenciales[usuario].fecha};`,(error,results,fields)=>{
                if(error) throw error;
                credencial_estatica.diccionario_credenciales[usuario]["fecha"] = fecha_actual;
                credencial_estatica.diccionario_credenciales[usuario]["access_token"] = datos.access_token; 
                credencial_estatica.diccionario_credenciales[usuario]["refresh_token"] = datos.refresh_token; 
                console.log("credencial ya actualizada en la funcion actualizarCredencial() final");
                console.log(credencial_estatica.diccionario_credenciales[usuario]);
                console.log(credencial_estatica.diccionario_credenciales[usuario].fecha);
                
            })

        }
        else {
            throw new Error("no posee access_token ni refresh_token");
        }
    });
}
async function traerListaDePublicaciones(usuario) {
    console.log("traerListaDePublicaciones()");
    try {
        estadistica.lista_dic_publicada_en_mercado_libre={};
        let request = await fetch('https://api.mercadolibre.com/users/' + credencial_estatica.diccionario_credenciales[usuario].user_id + '/items/search?search_type=scan&limit=100', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + credencial_estatica.diccionario_credenciales[usuario].access_token
            }
        })
        let request_en_json = await request.json();
        let cantidad_de_listas = 0;
        if (request_en_json.paging.total > 100)
            cantidad_de_listas = Math.floor(Number(request_en_json.paging.total) / 100);// redondea para abajo because in caso de que necesite leer una lista mas ya habra guardado la primer lista
        for (let i = 0; i < request_en_json.results.length; i++) estadistica.lista_dic_publicada_en_mercado_libre[request_en_json.results[i]] = {};
        let scroll_id = request_en_json.scroll_id;
        // console.log("la cantidad de publicaciones encontradas es: ",Object.keys(estadistica.lista_dic_publicada_en_mercado_libre).length);
        for (let i = 0; i < cantidad_de_listas; i++){
          try {
            await sleep(600);
            let respuesta = await fetch('https://api.mercadolibre.com/users/'+credencial_estatica.diccionario_credenciales[usuario].user_id+'/items/search?search_type=scan&limit=100&scroll_id='+scroll_id,{
                method:'GET',
                headers:{'Authorization': 'Bearer '+credencial_estatica.diccionario_credenciales[usuario].access_token}
            })
            let respuesta_en_json=await respuesta.json();
            if(respuesta_en_json.hasOwnProperty("results")){
                // console.log(respuesta_en_json.results);
                for (let j = 0; j < respuesta_en_json.results.length; j++) estadistica.lista_dic_publicada_en_mercado_libre[respuesta_en_json.results[j]] = {};
            }else{
                throw new Error(' es raro que no aparecio [results] en la obtencion de lista');
            }
            if(respuesta_en_json.hasOwnProperty("scroll_id")){
                // console.log("croll_id: " + respuesta_en_json.scroll_id);
                scroll_id=respuesta_en_json.scroll_id;
            }
            // console.log("la cantidad de publicaciones encontradas es: ",Object.keys(estadistica.lista_dic_publicada_en_mercado_libre).length);
            } catch (error) {
            // res.json({mensaje:"error en el intento: "+(i+2)+" de extraccion de pedir lista"+error})
            console.log(error);
            console.log("error en el intento: "+(i+2)+" de extraccion de pedir lista ");
            return null;
            }
        }
        
        // res.json({mensaje:"la cantidad de publicaciones encontradas es: "+Object.keys(estadistica.lista_dic_publicada_en_mercado_libre).length})
        console.log("la cantidad de publicaciones encontradas es: ",Object.keys(estadistica.lista_dic_publicada_en_mercado_libre).length);
        await sleep(500);
        let resultado_de_recorrer_publicaciones=await recorre_publicaciones(usuario);
        if(resultado_de_recorrer_publicaciones)return estadistica.lista_dic_publicada_en_mercado_libre;
        else return null;
        
    } catch (error) {
        console.log("credencial_estatica.diccionario_credenciales[usuario]");
        console.log(credencial_estatica.diccionario_credenciales[usuario]);
        console.log("credencial");
        console.log(error);
        return {mensaje:"error en el intento: 1 de extraccion de pedir lista "+error};
    }
    
}
async function recorre_publicaciones(usuario){
    let lista_llaves_publicados_en_mercado_libre=Object.keys(estadistica.lista_dic_publicada_en_mercado_libre);
    console.log(lista_llaves_publicados_en_mercado_libre.length);
    for (let i = 0; i < lista_llaves_publicados_en_mercado_libre.length; i++) {
        let logrado=false;
        while(!logrado){
            logrado=await extrae_1_publicacion(usuario,lista_llaves_publicados_en_mercado_libre[i]);
        }
    }
    fs.writeFileSync(path.join(__dirname,"lista_dic_publicado.json"),JSON.stringify(estadistica.lista_dic_publicada_en_mercado_libre),"utf-8");
    return true;
}
async function extrae_1_publicacion(usuario,idml_recibido){
    
        try {
            // console.log("tratare de extraer el:", idml_recibido);
            let publicacion = estadistica.lista_dic_publicada_en_mercado_libre[idml_recibido]; 
            // await sleep(15);
            await sleep(8);
            let respuesta=await axios.get('https://api.mercadolibre.com/items/'+idml_recibido,{
                // method:'GET',
                headers:{
                    'Authorization': 'Bearer '+credencial_estatica.diccionario_credenciales[usuario].access_token,
                    'content-type':'application/x-www-form-urlencoded'
                }
            });
            // let respuesta_en_json=await respuesta.json();
            let respuesta_en_json=respuesta.data;
            // console.log(respuesta_en_json.id+"  "+respuesta_en_json.title)
            // console.log(respuesta_en_json);
            if(respuesta_en_json.id=="MLA1166355310"){console.log("MLA1166355310"); console.log(respuesta_en_json);}
            if(respuesta_en_json.hasOwnProperty("id")&&respuesta_en_json.hasOwnProperty("title")&&respuesta_en_json.hasOwnProperty("attributes")){
                // publicacion=respuesta_en_json;
                // console.log("cantidad de atributos: ",respuesta_en_json.attributes.length);
                // incio de extraccion de datos
                publicacion["titulo_corto"]=respuesta_en_json.title;
                publicacion["id_ml"]=respuesta_en_json.id;
                publicacion["estado"]=respuesta_en_json.status;
                publicacion["permalink"]=respuesta_en_json.permalink;
                for (let j = 0; j < respuesta_en_json.attributes.length; j++) {
                    // console.log(respuesta_en_json.attributes[j]);
                    if(respuesta_en_json.attributes[j].hasOwnProperty("id")){
                        if(respuesta_en_json.attributes[j].id=="GTIN")publicacion["isbn"]=respuesta_en_json.attributes[j].value_name;
                        if(respuesta_en_json.attributes[j].id=="AUTHOR")publicacion["autor"]=respuesta_en_json.attributes[j].value_name;
                        if(respuesta_en_json.attributes[j].id=="BOOK_PUBLISHER")publicacion["editorial"]=respuesta_en_json.attributes[j].value_name;
                        if(respuesta_en_json.attributes[j].id=="BOOK_GENRE")publicacion["tema"]=respuesta_en_json.attributes[j].value_name;
                        if(respuesta_en_json.attributes[j].id=="SELLER_SKU")publicacion["sku"]=respuesta_en_json.attributes[j].value_name;
                        // if(respuesta_en_json.attributes[j].id=="AUTHOR")publicacion["autor"]=respuesta_en_json.attributes[j].value_name;
                    }
                }
                publicacion["stock"]=respuesta_en_json.available_quantity;
                publicacion["precio"]=respuesta_en_json.price;
                publicacion["foto1"]=respuesta_en_json.pictures[0].secure_url;
                // fin de extraccion de datos
                return true;
            }
            else{
                console.log("-------------------------------------------------------- no tiene id title ni atributes... | "+idml_recibido);
                return false;
            }
            // console.log("termine de extraer el:", posicion_lograda);
        } catch (error) {
            console.log("ERROR: al extraer el:", idml_recibido);
            console.log(error);
            return false;
        }
    // res.json({mensaje:"la cantidad de publicaciones encontradas es: "+Object.keys(estadistica.lista_dic_publicada_en_mercado_libre).length})
    // return {mensaje:estadistica.lista_dic_publicada_en_mercado_libre};
}

function reinicia_cantidad_publicada(){
    estadistica.publicados_correctamente=0;
    setTimeout(() => {
        reinicia_cantidad_publicada()
    }, 86400000);
}
reinicia_cantidad_publicada()
async function publicar(dato_publicacion, usuario) {
    // console.log(dato_publicacion);
    // console.log("dato_publicacion['titulo_corto']");
    // console.log(dato_publicacion['titulo_corto']);
    try {
        let resultado=await fetch('https://api.mercadolibre.com/items', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + credencial_estatica.diccionario_credenciales[usuario].access_token
            },
            // https://api.mercadolibre.com/oauth/token:'https://api.mercadolibre.com/oauth/token',
            body: JSON.stringify(
                {
                    title: dato_publicacion['titulo_corto'].slice(0, 60),
                    category_id: "MLA412445",
                    price: dato_publicacion['precio'],
                    currency_id: "ARS",
                    available_quantity: dato_publicacion['stock'],
                    buying_mode: "buy_it_now",
                    listing_type_id: "gold_special",
                    condition: "new",
                    // condition: dato_publicacion['condicion'],
                    description: {
                        plain_text: ""
                    },
                    // video_id:"https://www.youtube.com/watch?v=uG4Sixk2srw&list=PL2Z95CSZ1N4HM7gzW8gK1Jt3lGWQO0k_G",
                    sale_terms: [
                        {
                            id: "WARRANTY_TYPE",
                            value_name: "Garantía del vendedor"
                        },
                        {
                            id: "WARRANTY_TIME",
                            value_name: "30 días"
                        }
                    ],
                    pictures: [
                        {
                            source: dato_publicacion['foto1']
                        }
                    ],
                    attributes: [
                        {
                            id: "AUTHOR",
                            value_name: dato_publicacion['autor'] != "" ? dato_publicacion['autor'][0].toUpperCase() + dato_publicacion['autor'].slice(1) : ""
                        },
                        {
                            id: "BOOK_GENRE",
                            // value_name: dato_publicacion['genero']
                            value_name: dato_publicacion['tema']
                        },
                        {
                            id: "BOOK_TITLE",
                            value_name: dato_publicacion['titulo_corto']
                        },
                        {
                            id: "FORMAT",
                            value_id:"2132698",
                            // value_name: dato_publicacion['formato']
                            value_name: "Papel"
                        },
                        {
                            id: "GTIN",
                            name: "ISBN",
                            value_name: dato_publicacion['isbn'] // SOLO ACEPTA NUMEROS PERO EN STRING
                        },
                        {
                            id: "LANGUAGE",
                            // value_id: 2132698,
                            // value_name: dato_publicacion['idioma']
                            value_name: "Español"
                        },
                        {
                            id: "MAX_RECOMMENDED_AGE",
                            // value_name: dato_publicacion['edad_maxima']
                            value_name: "99 años"
                        },
                        {
                            id: "MIN_RECOMMENDED_AGE",
                            // value_name: dato_publicacion['edad_minima']
                            value_name: "6 años"
                        },
                        {
                            id: "NARRATION_TYPE",
                            // value_name: dato_publicacion['narracion']
                            value_name: dato_publicacion['tema']
                        },
                        {
                            id: "BOOK_PUBLISHER",
                            value_name: dato_publicacion['editorial']
                        },
                        {
                            id: "SELLER_SKU",
                            // value_name: dato_publicacion['sku']
                            value_name: "WALD"
                        }
                    ],
                    shipping: {
                        local_pick_up: true
                        // store_pick_up:true
                    }
                }
            )
        })
        let resultado_en_json=await resultado.json();//MLA1107829778,MLA1107823371 
        // console.log("resultado_en_json------------------------");
        // console.log(resultado_en_json);
        if (resultado_en_json.hasOwnProperty("id")) {
            if(resultado_en_json.id.indexOf("MLA")!=-1){
                estadistica.publicados_correctamente++;
                // dato_publicacion['idml']=datos['id'];
                let para_retornar=JSON.parse(JSON.stringify(dato_publicacion));
                para_retornar["id_ml"]=resultado_en_json.id;
                return para_retornar;
            }else return null;
        }else return null;
    } catch (error) {
        console.log(error);
        return null;
    }

}
module.exports = {
    insertCredencialToMysql: insertCredencialToMysql,
    ejecuta1Credencial: ejecuta1Credencial,
    reconocerFechaPorParametros: reconocerFechaPorParametros,
    ejecutarCredenciales: ejecutarCredenciales,
    getTablaCredenciales: getTablaCredenciales,
    traerListaDePublicaciones: traerListaDePublicaciones,
    publicar: publicar,
    fetch:fetch
}