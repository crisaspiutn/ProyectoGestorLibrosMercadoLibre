// import {describe, expect, test} from 'vitest';

// const {describe,test, expect} =require("jest");
const {iniciarConexionConLaBaseDeDatos,conexion,verificaQueSeConectoBien}=require("../modules/Connection");
const datos_para_conectar_mysql={
    host:process.env.HOST,
    database:process.env.DATABASE,
    user:process.env.USER,
    password:process.env.PASSWORD
}
const datos_para_conectar_mysql2={
    host:process.env.HOST,
    database:process.env.DATABASE,
    user:"process.env.USER",
    password:process.env.PASSWORD
}
describe("conectar", ()=>{
    test("verificar que se conecte",async()=>{
        // expect(()=>conectar()).toThrow();
        await iniciarConexionConLaBaseDeDatos(datos_para_conectar_mysql);
        // await expect(verificaQueSeConectoBien()).toBeTruthy();
        await expect(verificaQueSeConectoBien()).toBe(true);
    });
    test("dando datos incorrectos que devuelva error",async()=>{
        // expect(()=>conectar()).toThrow();
        // await iniciarConexionConLaBaseDeDatos(datos_para_conectar_mysql2);
        // await expect(async ()=>await verificaQueSeConectoBien()).toThrow();
        // await expect(verificaQueSeConectoBien()).toBeFalsy();
        // await expect(await verificaQueSeConectoBien()).toBe({});
        // await expect(verificaQueSeConectoBien()).toBe({});
    });
    // test("verificar variables de entorno puerto",()=>{
    //     expect(process.env.PORT).toBe("3000");
    // });
    // test("verificar variables de entorno puerto",()=>{
    //     expect(process.env.PORT).toBe("3000");
    // });
    // test("verificar variables de entorno PASSWORD",()=>{
    //     expect(process.env.PASSWORD).toBe("fasa123");
    // });
});