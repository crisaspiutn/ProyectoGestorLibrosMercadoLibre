require("./config/config");
// const {conexion} = require("./conexion/conexion");
const express = require("express");
const app = express();
const hbs=require("hbs");
const path=require("path");

const port = 6000;
app.set("port", process.env.PORT||port);
// configuro hbs

hbs.registerPartials(path.join(__dirname,"vistas/html"),function(error){})
app.set("view engine","hbs")

app.set("views",path.join(__dirname,"views"))

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const cors=require("cors")
app.use(cors())
app.use("/",require("./rutas/routes"));// necesita un tipo de dato router, no es solo importar la lista de codigos
app.use(express.static(path.join(__dirname,"public")));//importante usar path o indicar ruta completa

app.use((req,res,next)=>{
    res.status(404).send('no existe esta ruta');//parte para el navegador , otra parte para usuario
});

app.listen(app.get("port"), () => console.log("Example app listening on port ", Number(app.get("port"))))
// app.listen(8000, () => console.log("Example app listening on port ", Number(app.get("port"))))






// consultar("select * from tablausuarios")
function consultar(consulta){
    conexion.query(consulta,function(error,results,fields){
        if(error){
            console.log('error sucedido');
            throw error;
        }
        console.log("results");
        console.log(results);
        console.log("results");
        lista_nombres=Object.keys(results[0]);
        console.log(lista_nombres);
        results.forEach(element => {
            console.log(element);
        });
    }
    );
}