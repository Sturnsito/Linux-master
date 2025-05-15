// Importaremos la librerí­a de validación
const validator = require("validator");


// El método validar recibe los parámetros leí­dos
// retornará cierto o falso en función de si los parámetros pasan o no la validación
const validar = (parametros) => {
   //validamos los datos
   let validaTitle_isEmpty = validator.isEmpty(parametros.title);
   let validaTitleLength = validator.isLength(parametros.title, {min:2, max:30});


   let validaContain_isEmpty = validator.isEmpty(parametros.contain);


   if (validaTitle_isEmpty || !validaTitleLength || validaContain_isEmpty){
       return false;
   }


   return true;
}


// Declaramos la función validar para que pueda ser usada desde otro fichero
module.exports = {
   validar
}
