const nodemailer=require('nodemailer');

// origen : "correo@gmail.com" / cristianmultiutn@gmail.com
// destino: "cristianmultiutn@hotmail.com"
// asunto: "asunto" / Enviado desde nodemailer
// mensaje: "hola este es el mensaje quieres mas? xD"
function envia(origen, clave, destino, asunto, mensaje){ // origen, clave, destino, asunto, mensaje
  console.log("intento de envio de correo 2");
  var transporter=nodemailer.createTransport({
    // host:"smtp.ethernal.email",
    // host:"smtp.gmail.com",// para gmail 
    // host:"smtp.live.com",
    // host:"smtp.office365.com",
    // host:"smtp-mail.outlook.com",
    // host:"smtp-mail.outlook.com",
    host:"smtp.mail.yahoo.com",
    // host:"plus.smtp.mail.yahoo.com",
    // port:465,// para gmail 
    port:25,// para gmail 
    // port:587,
    service:'yahoo',
    secure:false,// para gmail
    // secureConnection: false,
    // tls: {
    //    ciphers:'SSLv3'
    // },
    auth:{
        user:origen,
        pass:clave
    },
    debug: false,
    logger: true
  });
  var mailOptions={
    // name:"cristian",
    from:origen,
    to:destino,
    subject:asunto,
    text:mensaje
  };
  transporter.sendMail(mailOptions,(error,info)=>{
    if(error)console.log('esto da error');
  });
}

module.exports={
  enviaCorreo:envia
}
// https://nodemailer.com/message/