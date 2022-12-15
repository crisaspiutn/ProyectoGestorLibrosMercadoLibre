const fs=require('fs');
const path=require('path');
const chalk=require('chalk');
const {comprobar_si_es_lista}=require("../complementos/utilidades");
if(fs.existsSync(path.join(__dirname,"lista_dic_publicado.json"))){
    console.log(chalk.green("exite"))
    let datos=fs.readFileSync(path.join(__dirname,"lista_dic_publicado.json"),"utf-8");
    let lista=JSON.parse(datos);
    comprobar_si_es_lista(lista)
    console.log(Object.keys(lista).length);
    console.log(lista[Object.keys(lista)[0]]);
}
else console.log(chalk.red("no existe"))
console.log()