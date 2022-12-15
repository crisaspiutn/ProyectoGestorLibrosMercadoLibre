const express = require("express")
const {conexion} = require("../connection/conexion");
const {borrarEspacios} = require("./../complementos/paracadenas");
const {fetch,insertCredencialToMysql, ejecuta1Credencial, reconocerFechaPorParametros, ejecutarCredenciales,getTablaCredenciales,traerListaDePublicaciones,publicar} = require("./../mercado/credenciales");
const {pausar_publicacion, actualizar_publicacion_precio_stock}=require("../mercado/actualizar");
const estadistica = require("./../mercado/estadistica");
const {verifica_y_carga_archivo} = require("./../complementos/leerexcel");
const credencial_estatica =require("../base/credencial_estatica");
// const {enviaCorreo} = require("../mail/envia-mail");
const fs=require("fs")
const path=require("path")
const multer=require("multer")
const mimeTypes=require("mime-types")
const router=express.Router();
const util=require("util");
const sleep = util.promisify(setTimeout);
const funcionQuery=util.promisify(conexion.query).bind(conexion);
const listaCredenciales=[];
(async()=>{// MEJORAR ESTE PROCEDIMIENTO, NO PUEDE HABER DESASOCIADO LA CREDENCIAL Y USUARIO
    credencial_estatica.diccionario_credenciales=await getTablaCredenciales(funcionQuery);
    ejecutarCredenciales(conexion,credencial_estatica.diccionario_credenciales);
})()
let lista_sesiones_tokens={};
let lista_publicadas=[]
// lista_sesiones_tokens["token"]="alazar"

function revisarUrlsiTieneToken(req){
    if(req.query.hasOwnProperty("token_de_servidor"))return true;
    else return false;
}
function buscarTokenEnListaDeSesiones(req){
    if(req.query.hasOwnProperty("token_de_servidor"))return true;
    else return false;
}
// INTERACCIONES CON LA BASE DE DATOS
async function obtenerListaDeArchivos(nombre_usuario_obtenido_segun_token_de_sesion){
    let lista_archivos=await funcionQuery(`select * from tablafiles where usuario="${nombre_usuario_obtenido_segun_token_de_sesion}";`)
    // console.log("lista de archivos: ",lista_archivos)
    return lista_archivos;
}
async function revisarSiUsuarioTieneCredencialAsociada(nombre_usuario_obtenido_segun_token_de_sesion){
    let resultado_credencial;
    try {
        resultado_credencial=await funcionQuery('select * from credenciales where usuario="'+nombre_usuario_obtenido_segun_token_de_sesion+'";')
        // console.log(lista_sesiones_tokens[token_de_servidor_obtenido]);// estaba activado y provoco error y no mostre error por eso no lo vi
        if(resultado_credencial.length==1)return true;
    } catch (error) {// logic a revisar
        return false;
    }
}
// INTERACCIONES CON LA BASE DE DATOS
// PARTES de router / 
async function siClientePoseeTokenValidoMostrar(token_de_servidor_obtenido,res){
    console.log("CLIENTE si posee token valido entre las sesiones.. => obtener nombre de usuario");
    let nombre_usuario_obtenido_segun_token_de_sesion=lista_sesiones_tokens[token_de_servidor_obtenido].name;
    console.log("nombre_usuario_obtenido_segun_token_de_sesion: ",nombre_usuario_obtenido_segun_token_de_sesion);

    // contiene usuario, namefile, nameasing
    let lista_de_archivos_obtenido=await obtenerListaDeArchivos(nombre_usuario_obtenido_segun_token_de_sesion);

    let con_credencial_agregada=false;
    con_credencial_agregada=await revisarSiUsuarioTieneCredencialAsociada(nombre_usuario_obtenido_segun_token_de_sesion);
    res.render("vistainiciada",{
        titulo:"bienvenido usuario: "+nombre_usuario_obtenido_segun_token_de_sesion,
        lista_archivos:lista_de_archivos_obtenido.reverse(),
        con_credencial_agregada:!con_credencial_agregada,

        contar_diferencias_entre_excel_y_base_de_datos:estadistica.contar_diferencias_entre_excel_y_base_de_datos,
        contar_existentes:estadistica.contar_existentes,
        contar_que_no_existen:estadistica.contar_que_no_existen,
        contar_actualizados:estadistica.contar_actualizados,
        publicados_correctamente:estadistica.publicados_correctamente
    })
}
router.get("/",async function(req,res){
    // console.log(req.body);
    // console.log(req.query);
    // console.log(req.originalUrl);///?token_de_servidor=islg2qdzdai

    if(revisarUrlsiTieneToken(req)){
        let token_de_servidor_obtenido=req.query.token_de_servidor;
        console.log("CLIENTE si posee algun token_de_servidor: "+token_de_servidor_obtenido,new Date().toString());
        if(lista_sesiones_tokens.hasOwnProperty(token_de_servidor_obtenido)){
            // console.log("----------------------------------------------------------------------------------------------iii");
            await siClientePoseeTokenValidoMostrar(token_de_servidor_obtenido,res);
        }
        else{
            res.render("inicio",{
                titulo:"sesion expirada"
            })
        }
    }
    else{
        res.render("inicio",{
            titulo:"no iniciaste"
        })
    }
})

router.post("/",function(req,res){
    console.log(req.body);
    conexion.query(`select * from tablausuarios where name="${req.body.name}"`,function(err,results,fields){
        if(err)throw err;
        // console.log(results);
        if(results.length>0){
            let datos=results[0]//obtiene un dic
            delete datos["imagen"]
            console.log(results[0]);
            if(datos.clave==req.body.clave){
                let token=random()
                lista_sesiones_tokens[token]=datos;
                res.send(token)
            }
            else{
                res.send("clave incorrecta")
            }
        }
        else {
            res.send("no existe el usuario")
        }
    })
    // if(req.body.name=="alazar"){
        
    //     console.log("si acerto");
    //     res.send("token")
    // }
})
router.use("/regis",require("./agregar_usuario/agregar_usuario"));

router.use("/barradecarga",require("./barradecarga"));
const storage=multer.diskStorage({
    destination:"src/files/",// pese a que esta dentro de src/routes es como que retrocedio y se metio a files // funciona normal // quiza porque se guia segun donde este el node modules
    filename:function(req,file,cb){
        console.log("req");// lo ideal poner un ------------------------------------------------------------------- indicador largo dentro de console
        let nombre_para_archivo=Date.now()+" "+file.originalname+"."+mimeTypes.extension(file.mimetype);
        // while()
        nombre_para_archivo=borrarEspacios(nombre_para_archivo)
        cb("",nombre_para_archivo);
        // console.log(req); //arbol de datos infinito
        // console.log(req.body); //[Object: null prototype] {}
        // console.log(req.query); //{}
        // console.log(req.params); //{}
        // console.log(req.url); ///file
        // console.log(req.ip); //0.0.1 o 0:1
        // console.log(req.headers); //pequeño arbol de datos
        // console.log(req.headers.referer); // url completa que tenia el cliente
        console.log("req");// lo ideal poner un ------------------------------------------------------------------- indicador largo dentro de console
    }
});
const upload=multer({ storage:storage })
router.post("/file",upload.single("de-h-a-nod"),(req,res)=>{
    console.time("inicia_subida_de_archivo")
    // console.log(req.query);// {}
    // console.log(req.query.token_de_servidor);
    console.log(req.body);
    console.log(req.params);// {}
    console.log();
    console.log(req.hostname);// localhost
    // console.log(req.body);// tremendo arbol de datos // en file no, el body de post es mas simple
    // console.log(req.file); // dar arbol de datos gigante
    console.log(req.file.size/1024);
    console.log("kb");
    console.log(req.file.destination);
    console.log(req.file.filename);//nombre del archivo
    conexion.query(`insert into tablafiles(usuario,namefile,nameasign) values("${lista_sesiones_tokens[req.headers.referer.split("token_de_servidor")[1].slice(1)].name}","${req.file.filename}","${req.body.archivo}")`,function(err,results,fields){
        if(err)throw err;
        console.timeEnd("inicia_subida_de_archivo");
    });
    console.log(__dirname);
    res.status(200).redirect("/")
})
router.get("/file/?",(req,res)=>{
    // console.log(req.params);// {}
    console.log(req.query);//{ '1658364093115 IMG-20190113-WA0073.jpg.jpeg': '' }
    // console.log(req.hostname);
    // console.log(req.url);
    // console.log(req.headers);
    // console.log(req.headers.referer.split("/file/")[1]);
    console.log(path.join(__dirname,"../files",Object.keys(req.query)[0]));
    res.sendFile(path.join(__dirname,"../files",Object.keys(req.query)[0]) );
    // console.log(path.join(__dirname,"../files","1658362896568  IMG-20190120-WA0024.jpg.jpeg"));
    // res.sendFile(path.join(__dirname,"../files","1658362896568  IMG-20190120-WA0024.jpg.jpeg") );
})
router.use("/borrar",require("./borrar"))
router.get("/notmodifiable",(req,res)=>{res.json(estadistica.lista_dic_publicadas_no_modificables)});
router.post("/actualizar",(req,res)=>{// a esta ruta entra cuando toco "une excel con BD"
    console.log("inicio intento de actualizar base de datos | une excel con DB");
    let diccionario_para_almacenar=verifica_y_carga_archivo(path.join(__dirname,"../files/"+req.body.para_actualizar));
    let llaves_de_excel;
    let diccionario_de_excel;
    estadistica.cantidad_de_publicaciones_en_base_de_datos=0;
    estadistica.ancho_de_barra_de_carga=0;// vacio para barra de carga
    estadistica.cantidad_de_publicaciones_en_base_de_datos=0;// para barra de carga

    estadistica.contar_diferencias_entre_excel_y_base_de_datos=0;// debio vaciarse por empezar de 0
    estadistica.contar_existentes=0;
    estadistica.contar_que_no_existen=0;
    estadistica.contar_actualizados=0;

    res.json({mensaje:{
        contar_existentes:estadistica.contar_existentes,
        contar_que_no_existen:estadistica.contar_que_no_existen,
        contar_actualizados:estadistica.contar_actualizados,
        publicados_correctamente:estadistica.publicados_correctamente
    }})
    if("publicaciones_to_mysql" in diccionario_para_almacenar){
        // console.log(Object.prototype.toString.call(diccionario_para_almacenar.publicaciones_to_mysql));
        diccionario_de_excel=diccionario_para_almacenar.publicaciones_to_mysql;

        llaves_de_excel=Object.keys(diccionario_de_excel);
        console.log("cantidad de claves validas: ",llaves_de_excel.length);
        conexion.query("select * from publicaciones",async function(err,results,fields){
            if (err) throw err;
            let llaves_de_base_de_datos=Object.keys(results);
            for (let i = 0; i < llaves_de_excel.length; i++) {
            // for (let i = 0; i < 2; i++) {
                const publicacion_de_excel = diccionario_de_excel[llaves_de_excel[i]];
                let existe=false;
                for (let j = 0; j < llaves_de_base_de_datos.length; j++) {
                    const publicacion_de_base_de_datos= results[llaves_de_base_de_datos[j]];
                    // console.log("indice i: ",i," j: ",j);
                    if(Number(publicacion_de_excel.isbn)==publicacion_de_base_de_datos.isbn){
                        // console.log("------------------------------------------ Encontrado");
                        existe=true;
                        if(publicacion_de_excel.stock!=publicacion_de_base_de_datos.stock||publicacion_de_excel.precio!=publicacion_de_base_de_datos.precio){
                            await funcionQuery(`update publicaciones set stock=${publicacion_de_excel.stock},precio=${publicacion_de_excel.precio} where isbn="${Number(publicacion_de_excel.isbn)}";`)
                            estadistica.contar_diferencias_entre_excel_y_base_de_datos++;
                        }
                        break;
                    }
                }
                if(!existe){
                    // console.log("no existe");
                    conexion.query(`insert into publicaciones(isbn,titulo_corto,autor,editorial,tema,precio,stock,foto1,valido,subido) values("${publicacion_de_excel.isbn}","${publicacion_de_excel.titulo_corto}","${publicacion_de_excel.autor}","${publicacion_de_excel.editorial}","${publicacion_de_excel.tema}",${publicacion_de_excel.precio},${publicacion_de_excel.stock},"${publicacion_de_excel.foto1}",0,0);`)
                }// else existe
            }
            console.log("termine de agregar los que se podia");
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            let token_en_header=req.headers.referer.split("token_de_servidor")[1].slice(1);
    if(!lista_sesiones_tokens.hasOwnProperty(token_en_header)){
        res.json({existe:false})
        return null;
    }
    // utiliza el token del usuario correcto
    let usuario_segun_token=lista_sesiones_tokens[token_en_header].name;
    // let credencial_segun_usuario=searchCredencialByUsuario(usuario_segun_token,listaCredenciales)

    // let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(credencial_segun_usuario)).mensaje;
    let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(usuario_segun_token));// 14/11
    /*       ***       PARA OBTENER DATOS DESDE ARCHIVO LOCAL       ***      */
    // let lista_dic_publicada_en_mercado_libre=(JSON.parse(fs.readFileSync( path.join(__dirname,"../mercado/lista_dic_publicado.json") ,"utf-8")));
    let lista_llaves_publicados_en_mercado_libre=Object.keys(lista_dic_publicada_en_mercado_libre)
    console.log("cantidad de claves validas: ",lista_llaves_publicados_en_mercado_libre.length);
    conexion.query("select * from publicaciones",async function(err,results,fields){
        if (err) throw err;
        let llaves_de_base_de_datos=Object.keys(results);
        estadistica.cantidad_de_publicaciones_en_base_de_datos=llaves_de_base_de_datos.length;// para barra de carga
        
        for (let j = 0; j < llaves_de_base_de_datos.length; j++) {
            estadistica.ancho_de_barra_de_carga++;
            const publicacion_de_base_de_datos= results[llaves_de_base_de_datos[j]];
            let existe=false;
            for (let i = 0; i < lista_llaves_publicados_en_mercado_libre.length; i++) {
                const publicacion_de_mercado_libre = lista_dic_publicada_en_mercado_libre[lista_llaves_publicados_en_mercado_libre[i]];
                // console.log("indice i: ",i," j: ",j);
                if(Number(publicacion_de_mercado_libre.isbn)==publicacion_de_base_de_datos.isbn){
                    // console.log("------------------------------------------ Encontrado");
                    existe=true;
                    // console.log(publicacion_de_mercado_libre.estado); //-------------------------------------------------------------------------------- MODIFICAR ABAJO PARA QUE SI REALICE CAMBIOS EN LAS QUE NO ESTAN ACTIVADAS
                    // if(publicacion_de_mercado_libre.estado=="active"&&publicacion_de_mercado_libre.sku=="WALD"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||publicacion_de_base_de_datos.price!=publicacion_de_mercado_libre.price)){
                    // if((publicacion_de_mercado_libre.sku).toLowerCase()=="WALD"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||publicacion_de_base_de_datos.price!=publicacion_de_mercado_libre.price)){
                    if((publicacion_de_mercado_libre.sku).toUpperCase()=="WALD"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||(Number(publicacion_de_base_de_datos.precio)*99/100)!=publicacion_de_mercado_libre.precio)){
                        // console.log("borrar si es undefined | precio de publicacion",publicacion_de_mercado_libre.precio);
                        // console.log("borrar si es undefined | precio de base de datos",publicacion_de_base_de_datos.precio);
                        let modo_habilitado_para_actualizar_publicacion=true;// habilitar el modo produccion que si ejecuta
                        // console.log("------------------------------------------ Encontrado");
                        try {
                            if(modo_habilitado_para_actualizar_publicacion){
                                if(publicacion_de_mercado_libre.estado=="under_review")estadistica.lista_dic_publicadas_no_modificables[publicacion_de_mercado_libre.id_ml]={
                                    id_ml:publicacion_de_mercado_libre.id_ml,
                                    titulo_corto:publicacion_de_mercado_libre.titulo_corto,
                                    precio:publicacion_de_mercado_libre.precio,
                                    precio_que_debio_ponerse:publicacion_de_base_de_datos.precio,
                                    stock:publicacion_de_base_de_datos.stock,
                                    stock_que_debio_ponerse:publicacion_de_base_de_datos.stock,
                                    permalink:publicacion_de_mercado_libre.permalink
                                };else if(publicacion_de_base_de_datos.stock<2){
                                    await sleep(100);
                                    console.log("inicio ############## pausa | publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                                    console.log("############## id_ml"+publicacion_de_mercado_libre.id_ml)
                                    await pausar_publicacion(publicacion_de_mercado_libre,usuario_segun_token);
                                    console.log("fin ############## pausa | publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                                }else{
                                    await sleep(100);
                                    console.log("inicio ############## publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                                    console.log("############## id_ml"+publicacion_de_mercado_libre.id_ml)
                                    await actualizar_publicacion_precio_stock(publicacion_de_mercado_libre, publicacion_de_base_de_datos, usuario_segun_token);
                                    console.log("fin ############## publicacion_de_mercado_libre.id_ml ############## actualizar.js")
        
                                }
                            }
                        } catch (error) {
                            console.log("----------PUBLICACION FALLIDA------------- SERA GUARDADA EN LOG PUBLICACIONES FALLIDAS")
                            let nueva_coleccion_de_datos_de_publicacion_fallida="id_ml de mercado libre"+publicacion_de_mercado_libre.id_ml+
                            "isbn mercado libre: "+publicacion_de_mercado_libre.isbn+" isbn db: "+publicacion_de_base_de_datos.isbn+
                            "precio mercado libre: "+publicacion_de_mercado_libre.precio+" precio db: "+publicacion_de_base_de_datos.precio+
                            "stock mercado libre: "+publicacion_de_mercado_libre.stock+" stock db: "+publicacion_de_base_de_datos.stock+
                            "estado mercado libre: "+publicacion_de_mercado_libre.estado+" estado db: "+publicacion_de_base_de_datos.estado+
                            `El ERROR FUE: 
                            ${error}`;
                            let lista_de_errores=JSON.parse(fs.readFileSync(path.join(__dirname,"../logs/publicaciones_fallidas.json"),"utf-8"));
                            lista_de_errores.push(nueva_coleccion_de_datos_de_publicacion_fallida);
                            fs.writeFileSync(path.join(__dirname,"../logs/publicaciones_fallidas.json"),JSON.stringify(lista_de_errores),"utf-8");
                        }
                        // else{estadistica.contar_actualizados++;}  // borrar si no lo necesito. solo esta para contar lo que hubiera actualizado si pudiera
                    }
                    
                    break;
                }
            }
            if(!existe){
                // console.log("no existe");
                estadistica.contar_que_no_existen++;
                // if(publicacion_de_base_de_datos.stock>5&&estadistica.publicados_correctamente<5){ // modo test
                if(publicacion_de_base_de_datos.stock>=2&&estadistica.publicados_correctamente<10000){// modo produccion
                    let modo_habilitado_para_publicar=true;// poner true para habilitar la accion de publicar libros
                    if(modo_habilitado_para_publicar){
                        await sleep(100);
                        const resultado=await publicar(publicacion_de_base_de_datos,usuario_segun_token);
                        // console.log(resultado);
                        if(resultado!=null)
                        if(resultado.hasOwnProperty("id_ml")){
                            //console.log(resultado.id_ml);
                            await funcionQuery(`update publicaciones set id_ml="${resultado.id_ml}" where isbn="${Number(resultado.isbn)}";`)
                        }
                        // console.log(resultado.id_ml);
                        // console.log(resultado);
                    }
                }
            }else{
                estadistica.contar_existentes++;
            } 
        }
        // NUNCA MAS IBA A TERMINAR DE RECORRER PARA LUEGO ENVIAR JSON
        // res.json({mensaje:{
        //     contar_existentes:estadistica.contar_existentes,
        //     contar_que_no_existen:estadistica.contar_que_no_existen,
        //     contar_actualizados:estadistica.contar_actualizados,
        //     publicados_correctamente:estadistica.publicados_correctamente
        // }})
        
    })
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // conexion.end()
        })
    }
    else{
        console.log("no esta la lista para almacenar en mysql");
        res.json({"mensaje":"no se pudo encontrar la lista para almacenar en mysql"})
    }
});
router.post("/addcredencial",(req,res)=>{
    console.log("req.body ------------------------------------");
    console.log(req.body);
    if(req.body.hasOwnProperty("access_token")&&req.body.hasOwnProperty("token_type")&&req.body.hasOwnProperty("expires_in")&&req.body.hasOwnProperty("scope")&&req.body.hasOwnProperty("user_id")&&req.body.hasOwnProperty("refresh_token")&&req.body.hasOwnProperty("fecha")&&req.body.hasOwnProperty("token_de_servidor")){

        // res.sendStatus(200)
        // console.log(req.body["token_de_servidor"]);
        // console.log(lista_sesiones_tokens[req.body["token_de_servidor"]]["name"]);
        let credencial=req.body;
        let usuario=lista_sesiones_tokens[req.body["token_de_servidor"]]["name"]
        credencial["usuario"]=usuario;
        credencial["fecha"]=Number(reconocerFechaPorParametros(req.body.fecha.an, req.body.fecha.me, req.body.fecha.di, req.body.fecha.ho, req.body.fecha.mi, req.body.fecha.se));
        insertCredencialToMysql(conexion,usuario,credencial);
        // listaCredenciales.push(credencial);
        credencial_estatica.diccionario_credenciales[usuario]=credencial;
        ejecuta1Credencial(usuario,conexion)
        res.json({color:"green"});
    }else{
        res.json({color:"blue"});
    }
    console.log("------------------------------------ req.body");
});
router.get("/extraidos_de_excels",async(req,res)=>{
    // verifica si el cliente tiene el token
    let token_en_header=req.headers.referer.split("token_de_servidor")[1].slice(1);
    if(!lista_sesiones_tokens.hasOwnProperty(token_en_header)){
        res.json({existe:false})
        return null;
    }
    let resultado=await funcionQuery("select * from publicaciones");
    //console.log(resultado);
    res.json(resultado);
});
router.get("/publicar",async(req,res)=>{
    console.log("publicar o actualizar publicaciones en mercado libre");
    // verifica si el cliente tiene el token
    let token_en_header=req.headers.referer.split("token_de_servidor")[1].slice(1);
    if(!lista_sesiones_tokens.hasOwnProperty(token_en_header)){
        res.json({existe:false})
        return null;
    }
    // utiliza el token del usuario correcto
    let usuario_segun_token=lista_sesiones_tokens[token_en_header].name;
    // let credencial_segun_usuario=searchCredencialByUsuario(usuario_segun_token,listaCredenciales)

    // let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(credencial_segun_usuario)).mensaje;
    let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(usuario_segun_token));
    let lista_llaves_publicados_en_mercado_libre=Object.keys(lista_dic_publicada_en_mercado_libre)
    console.log("cantidad de claves validas: ",lista_llaves_publicados_en_mercado_libre.length);
    conexion.query("select * from publicaciones",async function(err,results,fields){
        if (err) throw err;
        let llaves_de_base_de_datos=Object.keys(results);
        for (let j = 0; j < llaves_de_base_de_datos.length; j++) {
            const publicacion_de_base_de_datos= results[llaves_de_base_de_datos[j]];
            let existe=false;
            for (let i = 0; i < lista_llaves_publicados_en_mercado_libre.length; i++) {
                const publicacion_de_mercado_libre = lista_dic_publicada_en_mercado_libre[lista_llaves_publicados_en_mercado_libre[i]];
                // console.log("indice i: ",i," j: ",j);
                if(Number(publicacion_de_mercado_libre.isbn)==publicacion_de_base_de_datos.isbn){
                    console.log("------------------------------------------ Encontrado: ",publicacion_de_mercado_libre.isbn);
                    existe=true;
                    // console.log(publicacion_de_mercado_libre.estado); //-------------------------------------------------------------------------------- MODIFICAR ABAJO PARA QUE SI REALICE CAMBIOS EN LAS QUE NO ESTAN ACTIVADAS
                    // if(publicacion_de_mercado_libre.estado=="active"&&publicacion_de_mercado_libre.sku=="WALD"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||publicacion_de_base_de_datos.price!=publicacion_de_mercado_libre.price)){
                    // if((publicacion_de_mercado_libre.sku).toLowerCase()=="WALD"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||publicacion_de_base_de_datos.price!=publicacion_de_mercado_libre.price)){
                    if((publicacion_de_mercado_libre.sku).toLowerCase()=="wald"&&(publicacion_de_base_de_datos.stock!=publicacion_de_mercado_libre.stock||(Number(publicacion_de_base_de_datos.precio)*99/100)!=publicacion_de_mercado_libre.price)){
                        let modo_habilitado_para_actualizar_publicacion=false;// habilitar el modo produccion que si ejecuta
                        if(modo_habilitado_para_actualizar_publicacion){
                            if(publicacion_de_base_de_datos.stock<4){
                                await sleep(100);
                                console.log("############## pausa | publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                                console.log(publicacion_de_mercado_libre.id_ml)
                                await pausar_publicacion(publicacion_de_mercado_libre,usuario_segun_token);
                                console.log("############## pausa | publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                            }else{
                                await sleep(100);
                                console.log("############## publicacion_de_mercado_libre.id_ml ############## actualizar.js")
                                console.log(publicacion_de_mercado_libre.id_ml)
                                await actualizar_publicacion_precio_stock(publicacion_de_mercado_libre, publicacion_de_base_de_datos, usuario_segun_token);
                                console.log("############## publicacion_de_mercado_libre.id_ml ############## actualizar.js")
    
                            }
                            
                        }
                        // else{estadistica.contar_actualizados++;}  // borrar si no lo necesito. solo esta para contar lo que hubiera actualizado si pudiera
                    }
                    
                    break;
                }
            }
            if(!existe){
                // console.log("no existe");
                estadistica.contar_que_no_existen++;
                // if(publicacion_de_base_de_datos.stock>5&&estadistica.publicados_correctamente<5){ // modo test
                if(publicacion_de_base_de_datos.stock>=4&&estadistica.publicados_correctamente<10){// modo produccion
                    let modo_habilitado_para_publicar=true;// poner true para habilitar la accion de publicar libros
                    if(modo_habilitado_para_publicar){
                        await sleep(100);
                        const resultado=await publicar(publicacion_de_base_de_datos,usuario_segun_token);
                        // console.log(resultado);
                        if(resultado!=null)
                        if(resultado.hasOwnProperty("id_ml")){
                            //console.log(resultado.id_ml);
                            await funcionQuery(`update publicaciones set id_ml="${resultado.id_ml}" where isbn="${Number(resultado.isbn)}";`)
                        }
                        // console.log(resultado.id_ml);
                        // console.log(resultado);
                    }
                }
            }else{
                estadistica.contar_existentes++;
            } 
        }
        res.json({mensaje:{
            contar_existentes:estadistica.contar_existentes,
            contar_que_no_existen:estadistica.contar_que_no_existen,
            contar_actualizados:estadistica.contar_actualizados,
            publicados_correctamente:estadistica.publicados_correctamente
        }})
        
    })

    // res.json(credencial_segun_usuario);
});
router.get("/productos",async(req,res)=>{//traer Lista De Publicaciones de productos de Mercadolibre
    // verifica si el cliente tiene el token
    let token_en_header=req.headers.referer.split("token_de_servidor")[1].slice(1);
    if(!lista_sesiones_tokens.hasOwnProperty(token_en_header)){
        res.json({existe:false})
        return null;
    }
    // utiliza el token del usuario correcto
    let usuario_segun_token=lista_sesiones_tokens[token_en_header].name;
    // let credencial_segun_usuario=searchCredencialByUsuario(usuario_segun_token,listaCredenciales);
    try {
        // res.json()
        // let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(credencial_segun_usuario)).mensaje;
        let lista_dic_publicada_en_mercado_libre=(await traerListaDePublicaciones(usuario_segun_token)).mensaje;
        // let lista=await funcionQuery("select * from publicaciones where id>1000 and id<1500 and stock != 0 ;");// no se puede acceder directamente la ubicacion 0 de la lista
        // console.log(unidad[0]);
        
        res.json({mensaje:lista_dic_publicada_en_mercado_libre})
    } catch (error) {
        res.json({mensaje:`error en try al intentar traer una publicacion
        ${error}
        `})
    }
})
function random() {
    return Math.random().toString(36).substr(2); // Eliminar `0.`
};
function searchCredencialByUsuario(usuario,lista_credencial){
    for (let i = 0; i < lista_credencial.length; i++) {
        const element = lista_credencial[i];
        if(element.usuario==usuario)return element;
    }
    return null;
}
// function sleep(milliseconds) {
//     var start = new Date().getTime();
//     for (var i = 0; i < 1e7; i++) {
//         if ((new Date().getTime() - start) > milliseconds) {
//         break;
//         }
//     }
// }

module.exports=router;
