const {borrarEspacios} =require("./paracadenas")
var XLSX = require('xlsx');
var fs = require('fs');
function leeExcel(ruta_de_archivo_excel){
    let lista_excel = cargar_archivo_excel(ruta_de_archivo_excel);
    console.log(Object.keys(lista_excel[0]));
    console.log(Object.values(lista_excel[0]));
}
function verifica_y_carga_archivo(archivo){
    console.log("____________________________________ verifica y carga ____________________________________");
    // if(fs.existsSync(archivo))
    // console.log("si existe");
    let lista_excel=cargar_archivo_excel(archivo)
    let lista_fallados=[];
    let diccionario_publicaciones={};
    let lista_llaves=Object.keys(lista_excel[0]);
    // console.log("lista_llaves");
    // console.log(lista_llaves);
    let lista_valores=Object.values(lista_excel[0]);
    // console.log("lista_valores");
    // console.log(lista_valores);
    // console.log("largo de llaves: ",lista_llaves.length);
    // console.log("largo de valores: ",lista_valores.length);
    let contar_valores=0;
    let contar_llaves=0;
    let lista_de_palabras_para_reconocer_si_es_la_clave=["titulo","isbn","stock","cantidad","precio","foto","portada","pvp"]
    for (let i = 0; i < lista_de_palabras_para_reconocer_si_es_la_clave.length; i++) {
        for (let j = 0; j < lista_valores.length; j++) {
            // console.log(lista_de_palabras_para_reconocer_si_es_la_clave[i].toUpperCase()+"  es igual?  "+lista_valores[j].toUpperCase());
            if(lista_de_palabras_para_reconocer_si_es_la_clave[i].toString().toUpperCase()==lista_valores[j].toString().toUpperCase()){
                // console.log("encontro o coincidio con los valores del diccionario de uno");
                contar_valores++;
            }
            if(lista_de_palabras_para_reconocer_si_es_la_clave[i].toString().toUpperCase()==lista_llaves[j].toString().toUpperCase()){
                // console.log("coincidio con las llaves del diccionario de uno");
                contar_llaves++;
            }
        }
    }
    if(contar_llaves>contar_valores){
        console.log("modo clave en claves");
        console.log(lista_excel.length," items para analizar");
        const listaNumeros= /^[0-9]*$/;
        let llave_real_titulo=searchKeyFromDictionary(lista_excel[0],"titulo");
        let llave_real_isbn=searchKeyFromDictionary(lista_excel[0],"isbn");
        let llave_real_precio=searchKeyFromDictionary(lista_excel[0],"pvp");
        let llave_real_stock=searchKeyFromDictionary(lista_excel[0],"stock");
        let llave_real_Autor=searchKeyFromDictionary(lista_excel[0],"Autor");
        let llave_real_Editorial=searchKeyFromDictionary(lista_excel[0],"Editorial");
        let llave_real_Tema=searchKeyFromDictionary(lista_excel[0],"Tema");
        let llave_real_Portada=searchKeyFromDictionary(lista_excel[0],"Portada");
        for (let i = 0; i < lista_excel.length; i++) {
            const element = lista_excel[i];
            let campo_aceptable_titulo=false;
            let campo_aceptable_isbn=false;
            let campo_aceptable_precio=false;
            let campo_aceptable_stock=false;
            if(element.hasOwnProperty(llave_real_isbn)){
                if(element[llave_real_isbn]!=null){
                    let valor_segun_llave=cambiar_todo_de(element[llave_real_isbn].toString()," ","");
                    if(valor_segun_llave!=""){// campo lleno
                        if (listaNumeros.test(valor_segun_llave)) {
                            campo_aceptable_isbn=true;
                        }else{
                            campo_aceptable_isbn=false;// no es necesario
                        }
                    }else{
                        campo_aceptable_isbn=false;// no es necesario
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_titulo)){// element.hasOwnProperty(llave_real_titulo) <--- esta implicito
                if(element[llave_real_titulo]!=null){
                    let valor_segun_llave=element[llave_real_titulo].toString();
                    if (valor_segun_llave!="") {
                        campo_aceptable_titulo=true;
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_precio)){
                if(element[llave_real_precio]!=null){
                    let valor_segun_llave=element[llave_real_precio].toString();
                    if(valor_segun_llave!=""&&!(valor_segun_llave.indexOf(",")!=-1&&valor_segun_llave.indexOf(".")!=-1)) {
                        valor_segun_llave=cambiar_todo_de(valor_segun_llave,",","")
                        valor_segun_llave=cambiar_todo_de(valor_segun_llave,".","")
                        if(listaNumeros.test(valor_segun_llave))
                        campo_aceptable_precio=true;
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_stock)){
                if(element[llave_real_stock]!=null){
                    let valor_segun_llave=element[llave_real_stock].toString();
                    if(valor_segun_llave!=""&&listaNumeros.test(valor_segun_llave)){
                        campo_aceptable_stock=true;
                    }
                }
            }
            if(campo_aceptable_isbn&&campo_aceptable_titulo&&campo_aceptable_precio&&campo_aceptable_stock){
                let publicacion={
                    titulo_corto:check_to_save_in_mysql(element[llave_real_titulo]),
                    isbn:cambiar_todo_de(element[llave_real_isbn].toString()," ",""),
                    precio:parseFloat(element[llave_real_precio]),
                    stock:parseInt(element[llave_real_stock])
                }
                if(element.hasOwnProperty(llave_real_Autor)) {
                    publicacion["autor"]=element[llave_real_Autor]!=""?check_to_save_in_mysql(element[llave_real_Autor]):"";
                }else{
                    publicacion["autor"]="";
                }
                if(element.hasOwnProperty(llave_real_Editorial)) {
                    publicacion["editorial"]=element[llave_real_Editorial]!=""?check_to_save_in_mysql(element[llave_real_Editorial]):"";
                }else{
                    publicacion["editorial"]="";
                }
                if(element.hasOwnProperty(llave_real_Tema)) {
                    publicacion["tema"]=element[llave_real_Tema]!=""?check_to_save_in_mysql(element[llave_real_Tema]):"";
                }else{
                    publicacion["tema"]="";
                }
                if(element.hasOwnProperty(llave_real_Portada)) {
                    if(cambiar_todo_de(element[llave_real_Portada].toString()," ","")!=""){
                        publicacion["foto1"]=check_to_save_in_mysql(element[llave_real_Portada].split(",")[0]);// agregar funciones para agregar mas fotos, limite 9
                    }else{
                        publicacion["foto1"]="";
                    }
                }else{
                    publicacion["foto1"]="";
                }
                diccionario_publicaciones[cambiar_todo_de(element[llave_real_isbn].toString()," ","")]=publicacion;
            }else{
                lista_fallados.push(element);
            }

        }
    }
    else{
        console.log("modo clave en valores");
        console.log(lista_excel.length," items para analizar");
        const listaNumeros= /^[0-9]*$/;
        let llave_real_titulo=searchValueFromDictionary(lista_excel[0],"titulo");
        let llave_real_isbn=searchValueFromDictionary(lista_excel[0],"isbn");
        let llave_real_precio=searchValueFromDictionary(lista_excel[0],"pvp");
        let llave_real_stock=searchValueFromDictionary(lista_excel[0],"stock");
        let llave_real_Autor=searchValueFromDictionary(lista_excel[0],"Autor");
        let llave_real_Editorial=searchValueFromDictionary(lista_excel[0],"Editorial");
        let llave_real_Tema=searchValueFromDictionary(lista_excel[0],"Tema");
        let llave_real_Portada=searchValueFromDictionary(lista_excel[0],"Portada");
        for (let i = 1; i < lista_excel.length; i++) {
            const element = lista_excel[i];
            let campo_aceptable_titulo=false;
            let campo_aceptable_isbn=false;
            let campo_aceptable_precio=false;
            let campo_aceptable_stock=false;
            if(element.hasOwnProperty(llave_real_isbn)){
                if(element[llave_real_isbn]!=null){
                    let valor_segun_llave=cambiar_todo_de(element[llave_real_isbn].toString()," ","");
                    if(valor_segun_llave!=""){// campo lleno
                        if (listaNumeros.test(valor_segun_llave)) {
                            campo_aceptable_isbn=true;
                        }else{
                            campo_aceptable_isbn=false;// no es necesario
                        }
                    }else{
                        campo_aceptable_isbn=false;// no es necesario
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_titulo)){// element.hasOwnProperty(llave_real_titulo) <--- esta implicito
                if(element[llave_real_titulo]!=null){
                    let valor_segun_llave=element[llave_real_titulo].toString();
                    if (valor_segun_llave!="") {
                        campo_aceptable_titulo=true;
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_precio)){
                if(element[llave_real_precio]!=null){
                    let valor_segun_llave=element[llave_real_precio].toString();
                    if(valor_segun_llave!=""&&!(valor_segun_llave.indexOf(",")!=-1&&valor_segun_llave.indexOf(".")!=-1)) {
                        valor_segun_llave=cambiar_todo_de(valor_segun_llave,",","")
                        valor_segun_llave=cambiar_todo_de(valor_segun_llave,".","")
                        if(listaNumeros.test(valor_segun_llave))
                        campo_aceptable_precio=true;
                    }
                }
            }
            if(element.hasOwnProperty(llave_real_stock)){
                if(element[llave_real_stock]!=null){
                    let valor_segun_llave=element[llave_real_stock].toString();
                    if(valor_segun_llave!=""&&listaNumeros.test(valor_segun_llave)){
                        campo_aceptable_stock=true;
                    }
                }
            }
            if(campo_aceptable_isbn&&campo_aceptable_titulo&&campo_aceptable_precio&&campo_aceptable_stock){
                let publicacion={
                    titulo_corto:check_to_save_in_mysql(element[llave_real_titulo]),
                    isbn:cambiar_todo_de(element[llave_real_isbn].toString()," ",""),
                    precio:parseFloat(element[llave_real_precio]),
                    stock:parseInt(element[llave_real_stock])
                }
                if(element.hasOwnProperty(llave_real_Autor)) {
                    publicacion["autor"]=element[llave_real_Autor]!=""?check_to_save_in_mysql(element[llave_real_Autor]):"";
                }else{
                    publicacion["autor"]="";
                }
                if(element.hasOwnProperty(llave_real_Editorial)) {
                    publicacion["editorial"]=element[llave_real_Editorial]!=""?check_to_save_in_mysql(element[llave_real_Editorial]):"";
                }else{
                    publicacion["editorial"]="";
                }
                if(element.hasOwnProperty(llave_real_Tema)) {
                    publicacion["tema"]=element[llave_real_Tema]!=""?check_to_save_in_mysql(element[llave_real_Tema]):"";
                }else{
                    publicacion["tema"]="";
                }
                if(element.hasOwnProperty(llave_real_Portada)) {
                    if(cambiar_todo_de(element[llave_real_Portada].toString()," ","")!=""){
                        publicacion["foto1"]=check_to_save_in_mysql(element[llave_real_Portada].split(",")[0]);// agregar funciones para agregar mas fotos, limite 9
                    }else{
                        publicacion["foto1"]="";
                    }
                }else{
                    publicacion["foto1"]="";
                }
                // if(publicacion["isbn"]=="1133056221")console.log(publicacion); 
                // estoy usando el metodo de uso dinamico de clave para extraer valor, es decir no siempre sera isbn la llave. pero publicacion si tendra si o si llave isbn
                diccionario_publicaciones[cambiar_todo_de(element[llave_real_isbn].toString()," ","")]=publicacion;
            }else{
                lista_fallados.push(element);
            }
        }
    }
    // console.log(Object.keys(lista_excel[1]));
    // console.log(Object.values(lista_excel[1]));
    // console.log(diccionario_publicaciones[Object.keys(diccionario_publicaciones)[0]]);
    // console.log(lista_fallados[0]);
    // fs.writeFileSync("./../datos_de_salida.json",JSON.stringify(diccionario_publicaciones),"utf-8");
    return {publicaciones_to_mysql:diccionario_publicaciones,lista_fallados:lista_fallados};
}
function check_to_save_in_mysql(texto){
    texto=purifica_texto(texto);
    // console.log("------------------------------------------------------------------------------------------------------");
    texto=borrarEspacios(texto);
    // console.log("------------------------------------------------------------------------------------------------------");
    return texto.trim();
}
function searchIndexFromList(list,element){
    // console.log("element");
    // console.log(element);
    for (let i = 0; i < list.length; i++) {
        // const element = ;
        // console.log(list[i]);
        if (list[i].toString().toUpperCase()==element.toUpperCase()) {
            // console.log("indice");
            return i
        }
    }
    return null;
}
function searchKeyFromDictionary(diccionario,llave_a_buscar){
    let lista=Object.keys(diccionario)
    let result=searchIndexFromList(lista,llave_a_buscar)
    if (result==null) {
        return null;
    }else{
        return lista[searchIndexFromList(lista,llave_a_buscar)] 
    }
}
function searchValueFromDictionary(diccionario,llave_a_buscar){
    let lista=Object.values(diccionario)
    let llaves=Object.keys(diccionario)
    let result=searchIndexFromList(lista,llave_a_buscar)
    if (result==null) {
        return null;
    }else{
        return llaves[searchIndexFromList(lista,llave_a_buscar)] 
    }
}

function purifica_texto(texto){
    texto=texto.toLowerCase();
    let lista_para_cambiar=["*","‘","’","•","—","–",";","©","б","‘","  "];// ,":"
    let lista_para_borrar=["\n","\r","\t","[","]","{","}",'"',"'"];
    for (let i = 0; i < lista_para_cambiar.length; i++) {
        texto=cambiar_todo_de(texto,lista_para_cambiar[i]," ");
    }
    for (let i = 0; i < lista_para_borrar.length; i++) {
        texto=cambiar_todo_de(texto,lista_para_borrar[i],"");
    }
    return texto.trim();
}
function cambiar_todo_de(texto,caracter,new_caracter){
    while(texto.indexOf(caracter)!=-1){
        texto=texto.replace(caracter,new_caracter);
    }
    return texto;
}
function removeAccents(str){
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


/////////////////
function cargar_archivo_excel(archivoexcel){////////// extrae archivo EXCEL
    console.log('INICIA CARGA DE LIBROS WALD tipo lista');
    const excel=XLSX.readFile(archivoexcel);
    receptor=XLSX.utils.sheet_to_json(excel.Sheets[excel.SheetNames[0]],{cellDates: true});
    console.log('FINALIZA CARGA DE LIBROS WALD');
    return receptor;
}// devuelve lista


function buscarPorTitulo(lista_dic,palabra){
    // let palabra="Sol y sombra - BIOGRAFIA LOS RODRIGUEZ"
    for (let i = 0; i < lista_dic.length; i++) {
        const element = lista_dic[i];
        if(element.Titulo==palabra)console.log("el elemento que tiene este titulo es el: "+i);
    }
}
function buscarPorValor(lista_dic,palabra){
    // let palabra="Sol y sombra - BIOGRAFIA LOS RODRIGUEZ"
    for (let i = 0; i < lista_dic.length; i++) {
        const diccionario = lista_dic[i];
        const llaves_de_diccionario=Object.keys(diccionario);
        
        for (let j = 0; j < llaves_de_diccionario.length; j++) {
            const valores = diccionario[llaves_de_diccionario[j]];
            if(valores==palabra){
                console.log("encontre en el indice: ",i);
                console.log("encontre en la llave: "+llaves_de_diccionario[j]);
            }
        }
    }
}
module.exports={
    leeExcel:leeExcel,
    cargar_archivo_excel:cargar_archivo_excel,
    verifica_y_carga_archivo:verifica_y_carga_archivo
}