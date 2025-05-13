// RUTAS: article.js


// Declaramos el objeto router para manejar las rutas con express
const express = require("express");
// multer es la librería para subir archivos. Nos proporciona un 
// middleware a utilizar para la subida de archivos
const multer = require("multer");
// fs nos permite gestionar los archivos subidos
const fs = require("fs");
// sanitize-filename nos permite comprobar si el nombre del archivo 
// contiene caracteres problemáticos. 
// Se instala con npm install sanitize-filename --save
const sanitize = require('sanitize-filename');

const router = express.Router();

// Configuramos el middleware para multer, definimos un espacio de 
// almacenamiento que llamaremos “myStorage” (o como más te guste llamarlo)
const myStorage = multer.diskStorage({
    // Indicamos donde vamos a salvar los ficheros, en nuestro caso 
    // dentro de la ruta ./assets/images/articles
    // El objeto file contiene varias propiedades interesantes como el 
    // nombre, la ruta del fichero, el tipo,...
    // El método cb viene dado por multer y nos sirve para controlar 
    // las diferentes funcionalidades del middleware
    destination: (req, file, cb) => {
        cb(null, './assets/images/articles');
 
 
    },
    // Indicamos cómo se llamará el fichero subido
    filename: (req, file, cb) => {
        // Saneamos y modificamos el nombre del archivo transformando  
       // espacios en subrayados y eliminado lo que no se encuentre en 
  // la expresión regular dada por /[^a-zA-Z0-9._-]/g
        let filename = sanitize(file.originalname).replace(/ /g, '_');
        filename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
      // Le añadimos una fecha y hora al nombre para asegurarnos de que sea un nombre único
        cb(null, Date.now() + '_' + filename);
    }
 });
 
 
 // uploads es el middleware que hemos configurado
 const uploads = multer({storage: myStorage});
 
 
 // Lista de mimetypes válidos para imágenes
 const validImageMimetypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
 ];
 
 
 // Middleware para validar el mimetype del archivo. El fichero que nos 
 // sube multer se envía mediante la colección form-data del body y se 
 // accede al mismo desde el objeto file del request
 const validateImageMimetype = (req, res, next) => {
    if (!req.file) {
       // Si no tenemos archivo subido retornamos un mensaje de error
        return res.status(400).json({
            mensaje: "No se ha subido ningún archivo",
            status: "error"
        });
    }
 
 
    // Cargamos el tipo del archivo leyéndolo del objeto file que 
    // gestiona el objeto subido. Si quieres ver las propiedades de 
    // file, una forma rápida es hacer console.log(req.file);
    const mimetype = req.file.mimetype;
 
 
    if (!validImageMimetypes.includes(mimetype)) {
        // El método includes nos permite determinar si el mimetype del 
  // archivo subido está incluido en el array de tipos incluídos 
        // en validImageMimetypes
 
 
       // Eliminamos el archivo si el mimetype no es válido con el 
       // método unlink del objeto fs. Le pasamos el path del archivo a 
       // borrar y una función de callback para controlar si el archivo 
       // se pudo eliminar o no
   fs.unlink(req.file.path, (err) => {
            if (err) {
                return res.status(500).json({
                    mensaje: "Error al eliminar el archivo no válido",
                    status: "error",
                    error: err.message
                });
            }
 
 
            return res.status(400).json({
                mensaje: "El tipo de archivo no es válido. Sólo se permiten imágenes.",
                status: "error"
            });
        });
    } else {
        next();
    }
 };

 
// Declaramos el objeto controlador para nuestras rutas
const articleController = require("../controllers/article.js");




//Rutas de prueba
router.get("/ruta-de-prueba", articleController.prueba);
router.get("/cursos", articleController.cursos);
router.post("/create", articleController.create);
router.get("/lista/:id?:page?:limit?", articleController.getArticles);
router.delete("/delete/:id", articleController.deleteArticle);
router.put("/update/:id", articleController.updateArticle);
router.get("/search/:topic", articleController.searchArticles);


// esta ruta hace uso de dos middlewares, es la encargada de subir un 
// fichero de imagen y asignarlo a un artículo cuyo id se pasa por 
// parámetro
router.post("/image/:id", 
      [uploads.single("file")], // middleware de multer
      validateImageMimetype, // middleware que comprueba el tipo
      articleController.uploadImage);


// esta ruta muestra la imagen cuyo nombre se le pasa por parámetro
router.get("/image/:filename", articleController.getImage);



module.exports = router;
