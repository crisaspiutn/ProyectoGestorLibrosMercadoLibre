// console.log("hola");
// localStorage.setItem("dato","hola");
// console.log(localStorage.dato);
// localStorage.clear();
// console.log(localStorage.length);
//// console.log(window.location);
function iniciar_sesion(){
    // console.log(window.location.origin);
    var url = new URL(window.location.origin),
    params = {token_de_servidor:localStorage.getItem("token_de_servidor")}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    if(window.location.href!=url.href){
        // console.log("no es igual");
        // console.log(url.href);
        // console.log(window.location.href);
        // window.location=url
        window.location.assign(url.href)// con href es mas adecuado y especifico
    }else{
        // console.log(url.href);
        // console.log(window.location.href);
        // console.log("si es igual");
    }
}
function verificar_si_hay_sesion_guardada(){
    if(localStorage.length==1)return true;
    else return false;
}

verificar_si_hay_sesion_guardada()?iniciar_sesion():null;
// http://localhost:5000/?token_de_servidor=token
const btn_iniciar=document.getElementById("btn_iniciar");
const msj_inicio_sesion=document.getElementById("msj_inicio_sesion");

const vista_registro=document.getElementById("vista_registro");

const formulario=document.getElementById("formulario");
// const registrar=document.getElementById("registrar");    
const usuario=document.getElementById("nombre");//
const clave=document.getElementById("clave");

formulario.addEventListener("submit",funcionar)
function funcionar(e){
    e.preventDefault();
    // e.stopPropagation();
    fetch("/",{
        method:"post",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            name:usuario.value,
            clave:clave.value
        })
    })
    .then(dat=>dat.text())
    .then(x=>{
        console.log(x);
        if(x=="no existe el usuario"){
            msj_inicio_sesion.innerText=x+"o la contraseña es incorrecta";
        }else{
            msj_inicio_sesion.innerText="";
            localStorage.setItem("token_de_servidor",x.toString())
            iniciar_sesion()
        }
        // verificar_si_hay_sesion_guardada()?iniciar_sesion():null;
        // window.location=x;
    })
}

btn_iniciar.addEventListener("click",function(){
    // if(vista_registro.style.display=="inherit")
    if(vista_registro.style.display=="none")
    vista_registro.style.display="inherit";
    else 
    vista_registro.style.display="none";
})



