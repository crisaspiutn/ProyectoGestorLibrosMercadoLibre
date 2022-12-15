const tabla_no_modificables=document.getElementById("tabla_no_modificables")
async function extraer_no_modificables(){
    let valor_obtenido=await fetch("/notmodifiable");
    let lista_dic_publicadas_no_modificables=await valor_obtenido.json();
    let lista_de_claves_no_modificables=Object.keys(lista_dic_publicadas_no_modificables);
    console.log("cantidad de no modificables",lista_de_claves_no_modificables.length);
    let html_content_publicationes="";
    for (let i = 0; i < lista_de_claves_no_modificables.length; i++) {
        console.log("encontre 1 para dibujar")
        // html_content_publicationes=html_content_publicationes+;
        let docu=document.createElement("div");
        docu.innerHTML=card_no_modifiable(lista_dic_publicadas_no_modificables[lista_de_claves_no_modificables[i]]);
        tabla_no_modificables.appendChild(docu);
    }
    // tabla_no_modificables.appendChild(html_content_publicationes);
}
extraer_no_modificables();
function card_no_modifiable(publicacion){
    return `<div class="card_no_modificable">        <div><strong>id_ml</strong><span>${publicacion.id_ml}</span></div>        <div><strong>titulo_corto</strong><span>${publicacion.titulo_corto}</span></div>        <div><strong>precio</strong><span>${publicacion.precio}</span></div>        <div><strong>precio_que_debio_ponerse</strong><span>${publicacion.precio_que_debio_ponerse}</span></div>        <div><strong>stock</strong><span>${publicacion.stock}</span></div>        <div><strong>stock_que_debio_ponerse</strong><span>${publicacion.stock_que_debio_ponerse}</span></div>        <div><strong>permalink</strong><span>${publicacion.permalink} </span></div>    </div>`
}