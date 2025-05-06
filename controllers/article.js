// CONTROLADOR: article.js
const validator = require("validator");
const {validar} = require("../helpers/validar");
// usaremos el esquema definido para salvar los artículos en la BD
const Article = require("../models/Article.js");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require('path');
const sanitize = require('sanitize-filename');


// convertimos la función en asíncrona para que se espere a la 
// respuesta de la escritura en la base de datos
const create = async (req, res) => {


   // leemos los datos recibidos por post {title, contain}
   let parametros = req.body;

   try {


    if (!validar(parametros)){
        throw new Error("Información recibida no validada!");
    }


}catch(err){
    return  res.status(400).json({
        mensaje: "Se ha producido un error al validar datos en \/create",
        status: "error: "+err.message
    });
}

   //validamos los datos
   try {
       let validaTitle_isEmpty = validator.isEmpty(parametros.title);
       let validaTitleLength = validator.isLength(parametros.title, {min:5, max:30});


       let validaContain_isEmpty = validator.isEmpty(parametros.contain);


       if (validaTitle_isEmpty || !validaTitleLength || validaContain_isEmpty){
           throw new Error("Información recibida no validada!");
       }


   }catch(err){
       return  res.status(400).json({
           mensaje: "Se ha producido un error al validar datos en \/create",
           status: "error: "+err.message
       });
   }

   

   // creamos el objeto a guardar con los parámetros validados
   // el objeto sigue las propiedades del esquema Article definido
   const article = new Article(parametros);


   //guardamos el objeto en la base de datos
   try {
       // Usamos el método save del objeto article que hemos creado
       // con nuestro esquema con mongoose. Si todo va bien en
	 // articleSaved tendremos una copia del objeto json salvado
	 // y si se produce un error lo capturamos en el catch
       const articleSaved = await article.save();


       return res.status(200).json({
           mensaje: "Hemos guardado el artí­culo con /create",
           status: "success",
           article: articleSaved
       });
   } catch (err) {
       return res.status(400).json({
           mensaje: "No se ha guardado el artí­culo en /create",
           status: "error: " + err.message
       });
   }
};

const prueba = (req, res) => {
    return res.status(200).json({
        mensaje: "Soy una acción de prueba en mi controlador de artí­culos"
    });
 };
 

const cursos = (req, res) => {
    console.log("Se ha ejecutado el Endpoint 'cursos'");
   
    //Devolvemos una colección de objetos JSON
    return res.status(200).json([
        {
            curso: "Aprende API REST",
            autor: "AVG",
            url: "antoniovarela.es"
        },
        {
            curso: "Aprende P5js",
            autor: "AVG",
            url: "antoniovarela.es"
        }
    ]);
   
 };
 
 const getArticles = async (req, res) => {
    try {
      
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const id = req.query.id;
        
  let articles;
 
 
      
        if (id) {
            try {
                articles = await Article.find({_id: id})
                .lean()
                .exec();
            }
            catch (err) { 
                return res.status(404).json({
                    mensaje: `No se ha encontrado el artículo con el id: ${id} en /lista`,
                    status: "error: " + err.message
                });
            }                                         
        }
        else {
            articles = await Article.find({})
            .skip((page - 1) * limit)
            .limit(limit)

            .sort({date: -1})  
            .lean()
            .exec();
        }
 
 
        if (!articles || articles.length === 0) {
            return res.status(404).json({
                mensaje: "No se han encontrado artículos en /lista",
                status: "error"
            });
        }
 
 
        return res.status(200).json({
            status: "success",
            articles
        });
 
 
    } catch (err) {
        return res.status(404).json({
            mensaje: "Error desconocido al listar artí­culos en /lista",
            status: "error: " + err
        });
    }
 };
 
 const deleteArticle = async (req, res) => {
    try {
        // Extraer y limpiar el id del parámetro para cargar
  // correctamente el valor del id ya sea con localhost:3900/xxxx
  // o con localhost:3900/id=xxxx 
        const id = req.params.id.includes('=') ? 
  req.params.id.split('=')[1] : 
  req.params.id;
        // Si va bien en id tenemos el valor xxxx que representa al id
  // del artículo que deseamos eliminar
 
 
        // Verificar si el id es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                mensaje: `Debes proporcionar un id de artí­culo válido`,
                status: "error"
            });
        }
 
 
        // Intentar eliminar el artí­culo
        const articleDeleted = await Article.findOneAndDelete({ _id: id }).lean().exec();
 
 
        // Verificar si se eliminó el artí­culo
        if (!articleDeleted) {
            return res.status(404).json({
                mensaje: `No se ha encontrado el artículo con el id: ${id} proporcionado`,
                status: "error"
            });
        }
 // si tení­a un fichero de imagen asociado, deberí­amos eliminarlo
 const oldImage = articleDeleted.image;
 if (oldImage !== "default.png") {
     fs.unlink(path.join('./assets/images/articles/', oldImage), (err) => {
         if (err) {
             console.error("Error al eliminar la imagen antigua:", err.message);
         }
     });
 }

 
        // Devolver la respuesta de éxito y una copia del artí­culo
  // eliminado
        return res.status(200).json({
            status: "success",
            articleDeleted
        });
 
 
    } catch (err) {
        return res.status(500).json({
            mensaje: "Error al eliminar un artí­culo en /lista",
            status: "error: " + err.message
        });
    }
 };
 
 const updateArticle = async (req, res) => {
    try {
        // Extraer y limpiar el id del parámetro
        const id = req.params.id.includes('=') ? 
  req.params.id.split('=')[1] : 
  req.params.id;
       
        // Verificar si el id es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                mensaje: `Debes proporcionar un id de artí­culo válido`,
                status: "error"
            });
        }
 
 
        //obtener del body el resto de info
        let parametros = req.body;
        
        //validamos los datos
       if (!validar(parametros)){
        throw new Error("Información recibida para actualizar no pudo ser validada!");
    }

        // Agregamos la fecha de modificación
        parametros.date = Date.now();
 
 
        // Actualizamos el artí­culo
        const articleUpdated = 
   await Article.findOneAndUpdate(
 { _id: id }, // Filtro de búsqueda WHERE
 parametros,  // Valores a actualizar
 {new: true}) // Indico que retorne el artículo 
  // actualizado (no el que estaba en 
  // la base de datos
                           .lean()
                           .exec();
 
 
        // Devolver la respuesta de éxito y una copia del artí­culo
  // actualizado
        return res.status(200).json({
            status: "success",
            articleUpdated
        });
 
 
    }
    catch(err){
        return  res.status(400).json({
            mensaje: "Se ha producido un error al validar datos en \/create",
            status: "error: "+err.message
        });
    }
 };
 
 // Para subir una imagen al servidor
const uploadImage = async (req, res) => {
    try {
        // Extraer y limpiar el id del parámetro
        const id = req.params.id.includes('=') ? 
                   req.params.id.split('=')[1] : req.params.id;
       
        // Verificar si el id es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
 
 
            // No tenemos un ID válido. Pero el fichero ha sido subido. 
            // Debemos eliminarlo
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: "Error al eliminar el archivo no válido",
                        status: "error",
                        error: err.message
                    });
                }
            });
 
 
            return res.status(400).json({
                mensaje: `Debes proporcionar un id de artículo válido`,
                status: "error"
            });
        }
 
 
        // Buscar el artí­culo para comprobar si tiene una imagen 
  // asociada de una subida anterior, la antigua hay que 
  // eliminarla
        const article = await Article.findById(id).lean().exec();
        if (!article) {
            // El artículo no existe. Eliminar el archivo subido
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: "Error al eliminar el archivo no válido",
                        status: "error",
                        error: err.message
                    });
                }
            });
 
 
            return res.status(404).json({
                mensaje: "No se ha encontrado el artículo",
                status: "error"
            });
        }
 
 
        // Guardar el nombre de la imagen antigua si existe
      // recuerda que un artículo tenía definido un esquema en nuestro 
  // models/Article.js y en nuestra base de datos
        const oldImage = article.image;
 
 
        // Agregamos la imagen y la fecha de modificación
        const parametros = { image: req.file.filename, date: Date.now() };
 
 
        // Actualizamos el artículo
        const articleUpdated = await Article.findOneAndUpdate({ _id: id }, parametros, { new: true }).lean().exec();
 
 
        if (!articleUpdated) {
            return res.status(500).json({
                mensaje: "Error al actualizar el artí­culo",
                status: "error"
            });
        }
 
 
        // Si tuvo éxito la actualización y hay una imagen antigua, 
  // hay que intentar eliminarla
        if (oldImage && oldImage !== "default.png") {
            fs.unlink(path.join('./assets/images/articles/', oldImage), (err) => {
                if (err) {
                    console.error("Error al eliminar la imagen antigua:", err.message);
                }
            });
        }
 
 
        // Devolver la respuesta de éxito y una copia del artí­culo actualizado
        return res.status(200).json({
            status: "success",
            articleUpdated
        });
 
 
    }
    catch(err){
        return  res.status(400).json({
            mensaje: "Se ha producido un error al subir la imagen en \/image",
            status: "error: "+err.message
        });
    }
 };
 
 
 
 
 // Obtenemos la imagen cuyo nombre de archivo le pasamos por parámetro
 const getImage = async (req, res) => {
    try {
        // Saneamos el nombre del archivo
        const filename = sanitize(req.params.filename).replace(/ /g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
 
 
        if (!filename) {
            return res.status(400).json({
                mensaje: "El nombre del fichero proporcionado no es válido",
                status: "error"
            });
        }
 
 
      // Le añadimos al nombre del fichero, la carpeta donde se 
  // encuentran los archivos subidos
        const fname = path.join('./assets/images/articles/', filename);
        
      // Normalizamos la ruta de acceso al archivo para garantizar que 
  // sea consistente 
  const normalizedPath = path.normalize(fname);
 
 
      // Intentamos acceder al fichero para enviarlo al cliente que lo 
  // solicita
        fs.access(normalizedPath, fs.constants.F_OK, (err) => {
            if (!err) {
              // Enviamos el fichero con el sendFile del response y 
                // usamos el resolve del objeto path y así convertir la 
                // ruta normalizada del archivo enviado en una ruta 
                // absoluta
                return res.sendFile(path.resolve(normalizedPath));
            } else {
                console.error('Error al acceder al archivo:', err.message);
                return res.status(404).json({
                    mensaje: "El fichero no existe en /image",
                    status: "error"
                });
            }
        });
    } catch (err) {
        return res.status(500).json({
            mensaje: "Error al acceder al fichero en /image",
            status: "error: " + err.message
        });
    }
 };
 
 const searchArticles = async (req, res) => {
    try {
     
      // Leemos el parámetro que hemos denominado “topic” que contiene
      // el patrón de búsqueda
        const cadena = req.params.topic;
 
 
        // Buscamos todo lo que cumpla con el patrón en el campo “title” 
  // o en el campo “contain” o en el campo “image” 
  // $regex interpreta la cadena del patrón de búsqueda como una
        // expresión regular y como opciones le indicamos que ignore las 
        // diferencias de mayúsculas y minúsculas
  const articlesFound = await Article.find( {"$or": [
            { "title": { "$regex": cadena, "$options": "i"} },
            { "contain": { "$regex": cadena, "$options": "i"} },
            { "image": { "$regex": cadena, "$options": "i"} }
        ]}).sort({date: -1}).lean().exec();
 
 
        // Devolver la respuesta de Éxito y la lista de artículos 
  // encontrados (aunque sea una cadena vacía [] de artículos)
        return res.status(200).json({
            status: "success",
            articlesFound
        });
 
 
    }
    catch(err) {
        return res.status(500).json({
            mensaje: "Error al buscar artículos en /search",
            status: "error: " + err.message
        });
    }
 };
 

module.exports = {
    prueba,
    cursos,
    create,
    getArticles,
    deleteArticle,
    updateArticle,
    uploadImage,
    getImage,
    searchArticles,
 
 }
 