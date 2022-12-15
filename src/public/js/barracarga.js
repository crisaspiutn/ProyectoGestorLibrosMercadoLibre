
const carga=document.getElementById("carga")
const textcarga=document.getElementById("textcarga");
async function obtener_carga(){
    let valor_obtenido=await fetch("/barradecarga");
    let {ancho,cantidad_de_listas}=await valor_obtenido.json();
    console.log("ancho",ancho);
    console.log("cantidad_de_listas",cantidad_de_listas);
    ancho++;
    let calculo_final=parseInt(Number(100*ancho/(cantidad_de_listas)));
    textcarga.innerText=calculo_final;
    carga.style.width=calculo_final+'%';
}
obtener_carga();