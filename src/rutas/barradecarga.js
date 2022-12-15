const {Router} = require("express");
const router = Router();
const estadistica = require('./../mercado/estadistica');


router.get('/', (req, res)=>{
    res.json({
        ancho:estadistica.ancho_de_barra_de_carga,
        cantidad_de_listas:estadistica.cantidad_de_publicaciones_en_base_de_datos
    });
});

module.exports = router;