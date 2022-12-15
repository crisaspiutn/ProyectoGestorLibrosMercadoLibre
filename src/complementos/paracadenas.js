function borrarEspacios(cadena){
    let si_tuvo_espacio=false;
    let nuevaCadena="";
    // console.log("cadena");
    // console.log(cadena);
    // try {
      // if(""!=cadena.trim())
      if(cadena!=null)
      for (let i = 0; i < cadena.length; i++) {
        // console.log(cadena.codePointAt(i));
        if(cadena.codePointAt(i)==32&&si_tuvo_espacio){
          // console.log("hubo 32");
        }
        else{
          if (cadena.codePointAt(i)==32) {
            si_tuvo_espacio=true;
          }
          else{
            si_tuvo_espacio=false;
          }
          nuevaCadena+=cadena[i];
        }
      }
    // } catch (error) {
    //   console.log(error);
    //   console.log("cadena que provoco el error");
    //   console.log(cadena);
    // }
    
    return nuevaCadena
  }
  module.exports={
    borrarEspacios:borrarEspacios
  }
  