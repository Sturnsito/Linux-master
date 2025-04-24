// RUTAS: article.js


// Declaramos el objeto router para manejar las rutas con express
const express = require("express");
const router = express.Router();


// Declaramos el objeto controlador para nuestras rutas
const articleController = require("../controllers/article.js");




//Rutas de prueba
router.get("/ruta-de-prueba", articleController.prueba);
router.get("/cursos", articleController.cursos);
router.post("/create", articleController.create);
router.get("/lista/:id?:page?:limit?", articleController.getArticles);
router.delete("/delete/:id", articleController.deleteArticle);
router.put("/update/:id", articleController.updateArticle);




module.exports = router;
