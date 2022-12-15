// const estadistica=require('./estadistica');
const fs = require('fs');
const path = require('path');
let lista=fs.readFileSync(path.join(__dirname,"lista_dic_publicado.json"),"utf-8");
lista=JSON.parse(lista);
let lista_sin_repetidos=[];
let diccionario_sin_repetidos={};
for (let i = 0; i < Object.keys(lista).length; i++) {
    const element = lista[Object.keys(lista)[i]].isbn;
    diccionario_sin_repetidos[cambia(element)] = element; //
    if (!existe(element,lista_sin_repetidos)){
        lista_sin_repetidos.push(element);
    }
}
function existe(dato,lista){
    for (let i = 0; i < lista.length; i++) {
        if(cambia(lista[i])==cambia(dato))return true;
    }
    return false;
}
function cambia(numero){
    let es_numero=true;
    // let texto=numero+"";
    let texto=String(numero);
    console.log(texto);
    
    for (let i = 0; i < texto.length; i++) {
        let element = texto[i];
        // console.log(element);
        if(element==0||element==1||element==2||element==3||element==4||element==5||element==6||element==7||element==8||element==9){

        }
        else{
            console.log(element);
            es_numero =false;
        }
    }
    if(es_numero){return Number(numero)}
    else{
        console.log("valor: "+numero);
        throw new Error("error por que no es numero");
    }
}
console.log("largo de lista sin repetidos: ",lista_sin_repetidos.length);
console.log("largo de diccionario sin repetidos: ",Object.keys(diccionario_sin_repetidos).length);
fs.writeFileSync(path.join(__dirname, "sin_repetidos.json"), JSON.stringify(diccionario_sin_repetidos),"utf-8");
