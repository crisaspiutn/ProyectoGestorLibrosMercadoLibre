const excels=document.getElementById("lista_archivos");
excels.addEventListener("click",escuchalista);
function comprobar_si_es_lista(listaX){////////// comprueba si es una lista
    if (Object.prototype.toString.call(listaX) === '[object Array]')
        console.log('SII ES Lista');
    else 
        console.log('NOO ES Lista');
}
function dibujar_item(contenedor,diccionario){
    // let item_article=document.createElement("tr");
    let fila=document.createElement("tr");
    fila.innerHTML=`
    <td>${diccionario.isbn}</td>
    <td>${diccionario.titulo_corto}</td>
    <td>${diccionario.autor}</td>
    <td>${diccionario.editorial}</td>
    <td>${diccionario.tema}</td>
    <td>${diccionario.stock}</td>
    <td>${diccionario.precio}</td>
    <td><div class="imagen_item"><img src="${diccionario.foto1}" alt="no se encontro"></div></td>
    `;
    // item_article.innerHTML=`
    // <p><strong>titulo</strong><span>${diccionario.Titulo}</span></p>
    // <p><strong>autor</strong><span>${diccionario.Autor}</span></p>
    // <p><strong>editorial</strong><span>${diccionario.Editorial}</span></p>
    // <p><strong>isbn</strong><span>${diccionario.ISBN}</span></p>
    // <p><strong>tema</strong><span>${diccionario.Tema}</span></p>
    // <p><strong>pvp</strong><span>${diccionario.PVP}</span></p>
    // <p><strong>stock</strong><span>${diccionario.Stock}</span></p>
    // <img src="${diccionario.Portada}" alt="no encontrado">
    // `;
    contenedor.appendChild(fila);
}
const CANTIDAD_DE_ITEMS_POR_HOJA50=500;
function dibuja_tabla_con_items_segun_diccionario(tabla_indicada,lista_diccionario){
    tabla_indicada.innerHTML="";
    lista_dic_items_para_mostrar_en_tabla_auditorio=lista_diccionario;
    console.log(lista_diccionario);
    const llaves=Object.keys(lista_dic_items_para_mostrar_en_tabla_auditorio);
    
    let titulos1=document.createElement("tr");
    titulos1.innerHTML=`
                <th>ISBN</th>
                <th>Titulo</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Tema</th>
                <th>stock</th>
                <th>pvp</th>
                <th>Portada</th>`;
    // removeEventListener();
    mensaje_auditorio.innerText="cantidad de items: "+llaves.length;
    botones_auditorio.innerHTML="";
    let cantidad_de_hojas=Math.ceil(llaves.length/CANTIDAD_DE_ITEMS_POR_HOJA50)
    for (let j = 0; j < cantidad_de_hojas; j++) {
        let boton=document.createElement("button");
        boton.innerText=(j+1);
        boton.addEventListener("click",mostrar_rango);
        botones_auditorio.appendChild(boton);
    }

    tabla_indicada.appendChild(titulos1);
    // console.log(llaves);
    // for (let i = 0; i < llaves.length; i++) {
    if(llaves.length>CANTIDAD_DE_ITEMS_POR_HOJA50){
        for (let i = 0; i < CANTIDAD_DE_ITEMS_POR_HOJA50; i++) {
            dibujar_item(tabla_indicada,lista_dic_items_para_mostrar_en_tabla_auditorio[llaves[i]])
        }
    }else{
        for (let i = 0; i < llaves.length; i++) {
            dibujar_item(tabla_indicada,lista_dic_items_para_mostrar_en_tabla_auditorio[llaves[i]])
        }
    }
    
    
}
function mostrar_rango(e){
    let numero_de_lista=Number(e.target.innerText);
    numero_de_lista=numero_de_lista-1;
    const llaves=Object.keys(lista_dic_items_para_mostrar_en_tabla_auditorio);
    tabla.innerHTML="";
    let titulos1=document.createElement("tr");
        titulos1.innerHTML=`
                <th>ISBN</th>
                <th>Titulo</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Tema</th>
                <th>stock</th>
                <th>pvp</th>
                <th>Portada</th>`;
    tabla.appendChild(titulos1);

    if(llaves.length<(numero_de_lista+1)*CANTIDAD_DE_ITEMS_POR_HOJA50){
        for (let i = numero_de_lista*CANTIDAD_DE_ITEMS_POR_HOJA50; i < llaves.length; i++) {
            dibujar_item(tabla,lista_dic_items_para_mostrar_en_tabla_auditorio[llaves[i]]);
        }
    }else{

        for (let i = numero_de_lista*CANTIDAD_DE_ITEMS_POR_HOJA50; i < (numero_de_lista+1)*CANTIDAD_DE_ITEMS_POR_HOJA50; i++) {
            dibujar_item(tabla,lista_dic_items_para_mostrar_en_tabla_auditorio[llaves[i]]);
        }
    }
}
const tabla=document.getElementById("auditorio");// puede ser table o un div contenedor de filas y columnas
const mensaje_titulo=document.getElementById("mensaje_titulo")
const mensaje_auditorio=document.getElementById("mensaje_auditorio");// 
const botones_auditorio=document.getElementById("botones_auditorio");// puede ser table o un div contenedor de filas y columnas
function escuchalista(e){
    if(e.target.innerText=="une excel con BD"){
        // console.log(e.target.disabled);
        e.target.disabled=true;
        let archivo_a_actualizar=e.target.parentNode.childNodes[1].childNodes[3].childNodes[3].innerText;
        fetch("/actualizar",{
            method:"post",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                para_actualizar:archivo_a_actualizar
            })
        })
        .then(dato=>dato.json())
        .then(dat=>{
            console.log(dat);
            // console.log(dat.lista_para.length);
            // crear_elementos
            dibuja_tabla_con_items_segun_diccionario(tabla,dat);
            e.target.disabled=false;
        })
    }
    if(e.target.innerText=="eliminar"){
        let archivo_a_eliminar=e.target.parentNode.childNodes[1].childNodes[3].childNodes[3].innerText;
        fetch("/borrar",{
            method:"delete",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                para_eliminar:archivo_a_eliminar
            })
        }).then(x=>{
            if(x.status==200){
                // e.target.parentNode
                e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            }
        })
    }
}
const btn_todos=document.getElementById("btn_todos");
var lista_dic_items_para_mostrar_en_tabla_auditorio;
btn_todos.addEventListener("click",()=>{
    if(btn_todos.disabled==false){
        btn_todos.disabled=true;// no funciona en modo cadena de texto
        try {
            fetch("/productos")
            .then(x=>x.json())
            .then(data=>{
                console.log(data);
                if(data.hasOwnProperty("existe"))window.location.assign(window.location.origin);
                else{
                    console.log(data);
                    dibuja_tabla_con_items_segun_diccionario(tabla,data.mensaje);
                    btn_todos.disabled=false;
                    mensaje_titulo.innerText="todas las publicaciones en mercado libre";
                }
            })
        } catch (error) {
            window.location.assign(window.location.origin);
        }
    }
})
const contar_existentes=document.getElementById("contar_existentes")
const contar_diferencias_entre_excel_y_base_de_datos=document.getElementById("contar_diferencias_entre_excel_y_base_de_datos");
const contar_que_no_existen=document.getElementById("contar_que_no_existen")
const contar_actualizados=document.getElementById("contar_actualizados")
const publicados_correctamente=document.getElementById("publicados_correctamente")
const btn_publicar=document.getElementById("btn_publicar");
btn_publicar.addEventListener("click",()=>{
    if(btn_publicar.disabled==false){
        btn_publicar.disabled=true;
        fetch("/publicar")
        .then(x=>x.json())
        .then(data=>{
            if(data.hasOwnProperty("existe"))window.location.assign(window.location.origin);
            else{
                console.log(data);
                contar_diferencias_entre_excel_y_base_de_datos.innerText=data.mensaje.contar_diferencias_entre_excel_y_base_de_datos;
                contar_existentes.innerText=data.mensaje.contar_existentes;
                contar_que_no_existen.innerText=data.mensaje.contar_que_no_existen;
                contar_actualizados.innerText=data.mensaje.contar_actualizados;
                publicados_correctamente.innerText=data.mensaje.publicados_correctamente;

                btn_publicar.disabled=false;
                mensaje_titulo.innerText="boton publicar ejecutado completamente";
            }
        })
    }
})
const btn_extraidos_de_bd=document.getElementById("btn_extraidos_de_bd");
btn_extraidos_de_bd.addEventListener("click",()=>{
    if(btn_extraidos_de_bd.disabled==false){
        btn_extraidos_de_bd.disabled=true;
        fetch("/extraidos_de_excels")
        .then(x=>x.json())
        .then(data=>{
            if(data.hasOwnProperty("existe"))window.location.assign(window.location.origin);
            else{
                console.log(data);
                dibuja_tabla_con_items_segun_diccionario(tabla,data);
                btn_extraidos_de_bd.disabled=false;
                mensaje_titulo.innerText="todas las publicaciones de la base e datos";
            }
        })
    }
})