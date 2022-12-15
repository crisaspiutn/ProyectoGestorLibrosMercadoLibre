class estadistica {
    static publicados_correctamente = 0;
    static lista_dic_publicada_en_mercado_libre = {};
    static lista_dic_publicadas_no_modificables = {};
    static contar_existentes=0;
    static contar_que_no_existen=0;
    static contar_actualizados=0;
    static contar_diferencias_entre_excel_y_base_de_datos=0;

    static cantidad_de_publicaciones_en_base_de_datos=0;
    static ancho_de_barra_de_carga=0;
}
module.exports=estadistica;