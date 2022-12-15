function comprobar_si_es_lista(listaX){////////// comprueba si es una lista
    if (Object.prototype.toString.call(listaX) === '[object Array]')
        console.log('SII ES Lista');
    else 
        console.log('NOO ES Lista');
}
module.exports={
    comprobar_si_es_lista:comprobar_si_es_lista
}