const barra_estado_credencial=document.getElementById("credencial_activada");
function onChange(event) {
    barra_estado_credencial.style.backgroundColor="orange";
    var reader = new FileReader();
    reader.onload =(event)=>{
    credencial_global = JSON.parse(event.target.result);
    // var obj = JSON.parse(event.target.result);
    // console.log(obj);
    };
    reader.readAsText(event.target.files[0]);
    // console.log(event.target.result); //no funciona si no surge el evento
}
var credencial_global=null;
function onReaderLoad(event){
    console.log(event.target.result);
    credencial_global = JSON.parse(event.target.result);
}
function enviarCredencial(event){
    event.preventDefault();
    if(credencial_global!=null){
        credencial_global["token_de_servidor"]=localStorage.getItem("token_de_servidor");
        fetch("/addcredencial",{
            method:"post",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify(credencial_global)
        })
        .then(x=>x.json())
        .then(data=>{
            if(data.hasOwnProperty("color")){
                barra_estado_credencial.style.backgroundColor=data.color;
                // console.log("color recibido");
                // document.getElementById("formcredencial").removeEventListener()
            }
        })
    }
}
document.getElementById('file').addEventListener('change', onChange);
document.getElementById("formcredencial").addEventListener("submit",enviarCredencial);

