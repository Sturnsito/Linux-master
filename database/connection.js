// cargamos la funcionalidad de mongoose para conectar con la BD
const mongoose = require("mongoose");


// creamos una conexión en modo asíncrono y esperamos a que se produzca
// el retorno de la conexión
const connection = async () => {
    try{
        //conectamos con la base de datos local mi_blog
        //await mongoose.connect("mongodb://localhost:27017/mi_blog");
       
        //conectamos con la base de datos remota
        await mongoose.connect("mongodb+srv://carlosgomez:KHPGjVkRFTaMxjmq@cluster0.7jninur.mongodb.net/mi_blog");
  
  
        console.log("Conectado correctamente a la base de datos mi_blog!!");
    }
    catch(err){
        console.log(err);
        throw new Error("No pudo conectarse a la base de datos");
    }
  }
  


// exportamos la conexión para poder usarla en server.js
module.exports= {
   connection
}
