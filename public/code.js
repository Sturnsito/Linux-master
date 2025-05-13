// La única función que lanza a todas las demás es addEventListener
// esta función espera a recibir el evento DOMContentLoaded después
// de la carga del documento y se programa lo que debe hacerse después
// de que todos los elementos se hayan cargado
document.addEventListener("DOMContentLoaded", () => {


    // Definimos constantes para trabajar con las diferentes partes del
    // del documento, están definidas como ids en el index.html
    const articleList = document.getElementById("article-list");
    const articleForm = document.getElementById("article-form");
    const articleDetails = document.getElementById("article-detail");
    const sectionArticles = document.getElementById("articles");
    const sectionArticleDetails = document.getElementById("article-details");
    const sectionNewArticle = document.getElementById("new-article");
    const sectionUpdateArticle = document.getElementById("update-article");
    const sectionUploadImage = document.getElementById("upload-image");
   
    const sectionErrorMessage = document.getElementById("error-message");
    const errorMessage = document.getElementById("error-text");
 
 
    const pageInfo = document.getElementById("page-info");
 
 
    const sectionSearchResults = document.getElementById("search-results");
    const searchBox = document.getElementById("search-box");
    const searchButton = document.getElementById("search-button");
    const searchResultsList = document.getElementById("search-results-list");
 
 
    let currentPage = 1;
    let totalPages = 1;
    let limitArticlesPerPage = 2;
   
    // Función para mostrar una sección y ocultar las demás
    // Se muestra la sección que se indica en el parámetro, las demás 
    // permanecen ocultas
    const showSection = (section) => {
        sectionArticles.classList.add("hidden");
        sectionArticleDetails.classList.add("hidden");
        sectionNewArticle.classList.add("hidden");
        sectionUpdateArticle.classList.add("hidden");
        sectionUploadImage.classList.add("hidden");
        sectionSearchResults.classList.add("hidden");
        sectionErrorMessage.classList.add("hidden");
        section.classList.remove("hidden");
    };
 
 
    // Función para mostrar mensajes de error
    // muestra el mensaje de error que se recibe y lo oculta pasados 3 
    // segundos
    const showError = (message) => {
        errorMessage.textContent = message;
        sectionErrorMessage.classList.remove("hidden");
        setTimeout(() => {
            sectionErrorMessage.classList.add("hidden");
        }, 3000); // Ocultar después de 3 segundos
    };
 
 
    // Cargar artículos existentes. Recibe dos parámetros, la página a
    // mostrar y los artículos por página. Por defecto si no se indica
    // nada muestra la primera página con dos artí­culos por página
    const loadArticles = async (page = 1, limit = limitArticlesPerPage) => {
        try {
            // Obtenemos por GET la lista de artÃ­culos
            const response = await fetch(`/api/lista?page=${page}&limit=${limit}`);
            // Transformamos la respuesta a un objeto Json
            const data = await response.json();
            articleList.innerHTML = ''; // <-- Asegurar que se vacía siempre
 
 
            // Verificar que data es un objeto y verifica que contiene
            // un array de articles
            if (data.status === "success" && Array.isArray(data.articles)  && data.articles.length > 0) {
                const articles = data.articles;
                currentPage = page;
                totalPages = Math.ceil(data.total / limit);               
                // Recorremos el array de articles
                articles.forEach(article => {
                    const articleElement = document.createElement('div');
                    articleElement.className = 'article';
                    articleElement.innerHTML = `
                        <h3 class="article-title" data-id="${article._id}">${article.title}</h3>
                        <pre>${article.contain}</pre>
                        <button class="edit-article" data-id="${article._id}">Editar</button>
                        <button class="delete-article" data-id="${article._id}">Borrar</button>
                        <button class="upload-image" data-id="${article._id}">Subir Imagen</button>
                    `;
                    articleList.appendChild(articleElement);
                });
            } else if (data.status === "vacio" ){
                currentPage = page;
                totalPages = 1;
                articleList.innerHTML = `
                    <p>${data.mensaje}</p>
                `;
           }
            pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        } catch (error) {
            console.error('Error al cargar artículos:', error);
            showError('Error al cargar artículos');
        }
    };
 
 
 
 
    // Función para mostrar los detalles de un artículo
    // Usamos el mismo Endpoint que antes pero con un parámetro 
    // diferente
    const showArticleDetails = async (articleId) => {
        try {
     // Obtenemos por get el artículo cuyo id coincida con el indicado
            const response = await fetch(`/api/lista?id=${articleId}`);
            const data = await response.json();
 
 
            // Verificar que data es un objeto y contiene un array de  
 // articles
            if (data.status === "success" && Array.isArray(data.articles)) {
                const articles = data.articles;
               
                articleDetails.innerHTML = '';
                articles.forEach(article => {
                   
                    const articleElement = document.createElement('div');
                    articleElement.className = 'article';
                    articleElement.innerHTML = `
                        <h3>${article.title}</h3>
                        <pre>${article.contain}</pre>
                    `;
 
 
                    if (article.image !== "default.png") {
                 // Mostramos la imagen con otro EndPoint
                        articleElement.innerHTML += `
                           <img src="/api/image/${article.image}" >
                        `;
                    }
 
 
                    articleDetails.appendChild(articleElement);
                });
                showSection(sectionArticleDetails);
            } else {
                console.error('La respuesta de la API no es válida:', data);
                showError('La respuesta de la API no es válida');
            }
        } catch (error) {
            console.error('Error al cargar detalles del artí­culo:', error);
            showError('Error al cargar detalles del artículo');
        }
    };
 
 
    // Manejar el enví­o del formulario para añadir un nuevo artí­culo
    // interceptamos y reprogramamos el evento “submit” del formulario
    articleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
 
 
        try {
            // Enviamos por POST la petición para crear un artículo
 const response = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, contain: content }),
            });
            if (response.ok) {
                loadArticles();
            // Limpiamos el formulario del contenido anterior 
                articleForm.reset();
                showSection(sectionArticles);
            } else {
                console.error('Error al añadir artí­culo:', response.statusText);
                showError('Error al añadir artí­culo');
            }
        } catch (error) {
            console.error('Error al añadir artí­culo:', error);
            showError('Error al añadir artículo');
        }
    });
 
 
 
 
    // Manejar clics en el tí­tulo del artí­culo para mostrar detalles
    // o en los botones de las diferentes acciones
    articleList.addEventListener('click', (event) => {
        if (event.target.classList.contains('article-title')) {
            const articleId = event.target.dataset.id;
            showArticleDetails(articleId);
        }
        if (event.target.classList.contains('edit-article')) {
            const articleId = event.target.dataset.id;
            loadArticleForEditing(articleId);
        }
        if (event.target.classList.contains('delete-article')) {
            const articleId = event.target.dataset.id;
            deleteArticle(articleId);
        }
       
       
        if (event.target.classList.contains('upload-image')) {
            const articleId = event.target.dataset.id;
            showUploadImageForm(articleId);
        }
        
       
    });
    

   // Función para cargar un artí­culo en el formulario de edición
   const loadArticleForEditing = async (articleId) => {
    try {
        const response = await fetch(`/api/lista?id=${articleId}`);
        const data = await response.json();


        // Verificar que data es un objeto y contiene la propiedad articles
        if (data.status === "success" && Array.isArray(data.articles)) {
            const articles = data.articles;
           
            articleDetails.innerHTML = '';
            articles.forEach(article => {
                document.getElementById("update-id").value = article._id;
                document.getElementById("update-title").value = article.title;
                document.getElementById("update-content").value = article.contain;
            });
            showSection(sectionUpdateArticle);
        }
        else {
            console.error('La respuesta de la API no es válida:', data);
            showError('La respuesta de la API no es válida');
        }
    } catch (error) {
        console.error('Error al cargar artí­culo para editar:', error);
        showError('Error al cargar artículo para editar');
    }
};



// Manejar el enví­o del formulario para actualizar un artí­culo
const updateForm = document.getElementById("update-form");
updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById("update-id").value;
    const title = document.getElementById("update-title").value;
    const content = document.getElementById("update-content").value;


    try {
     // Usamos el método PUT para subir los datos del formulario 
// y llamar al Endpoint
        const response = await fetch(`/api/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, contain: content }),
        });
        if (response.ok) {
            loadArticles(currentPage);
            showSection(sectionArticles);
        } else {
            console.error('Error al actualizar artículo:', response.statusText);
            showError('Error al actualizar el artículo');
        }
    } catch (error) {
        console.error('Error al actualizar artículo:', error);
        showError('Error al actualizar el artículo');
    }
});


// Mostrar el diálogo para eliminar un artículo
const deleteArticle = async (articleId) => {
    if (!confirm("¿Estás seguro de que deseas borrar este artículo?")) {
        return;
    }


    try {
     // En este caso usamos el método DELETE para este Endpoint
        const response = await fetch(`/api/delete/${articleId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            loadArticles(currentPage);
        } else {
            console.error('Error al borrar artículo:', response.statusText);
            showError('Error al borrar el artículo');
        }
    } catch (error) {
        console.error('Error al borrar artículo:', error);
        showError('Error al borrar el artículo');
    }
};



// Mostrar el formulario para subir una imagen
const showUploadImageForm = (articleId) => {
    document.getElementById("upload-id").value = articleId;
    showSection(sectionUploadImage);
};



// Manejar el envío del formulario para subir una imagen
const uploadForm = document.getElementById("upload-form");
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById("upload-id").value;
    const formData = new FormData();
    const fileInput = document.getElementById("upload-file");
  // El formulario sube los ficheros por medio de la colección 
// form-Data del body, esto lo hemos comprobado cuando estábamos 
// programando el EndPoint y lo probamos con el cliente de 
// Postman
    formData.append('file', fileInput.files[0]);
  // Cuando vimos la programación del Endpoint llamamos al dato 
// “file0”, lo hemos cambiado todo por “file” (cuestión de 
// gustos, pero en la ruta también hemos quitado “file0” 
// y usado “file” a secas en el middleware de multer para la 
// ruta /image)


    try {
     // Usamos el método POST para subir el fichero al server
        const response = await fetch(`/api/image/${id}`, {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            showArticleDetails(id); // Volver a la vista de detalles del artículo
        } else {
            console.error('Error al subir imagen:', response.statusText);
            showError('Error al subir la imagen');
        }
    } catch (error) {
        console.error('Error al subir imagen:', error);
        showError('Error al subir la imagen');
    }
});



// Función para manejar la búsqueda de artículos


 // MEJORA: Incluir la funcionalidad de paginación en el resultado 
// de la lista de artículos encontrados. Esto no lo he 
// implementado pero sería un ejercicio curioso de aplicación de 
// conocimientos
const searchArticles = async (query) => {
    try {
        const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
        const data = await response.json();
 // Verificar que data es un objeto y contiene la propiedad articles
        if (data.status === "success" && Array.isArray(data.articlesFound)) {
            const articles = data.articlesFound;
            searchResultsList.innerHTML = '';
            if (articles.length > 0) {
                articles.forEach(article => {
                    const articleElement = document.createElement('div');
                    articleElement.className = 'article';
                    articleElement.innerHTML = `
                        <h3 class="article-title" data-id="${article._id}">${article.title}</h3>
                        <pre>${article.contain}</pre>
                    `;
                    searchResultsList.appendChild(articleElement);
                });
            } else {
                searchResultsList.innerHTML = '<p>No se encontraron artículos que coincidan con la búsqueda.</p>';
            }
            showSection(sectionSearchResults);
        } else {
            console.error('La respuesta de la API no es válida:', data);
            showError('La respuesta de la API no es válida');
        }
    } catch (error) {
        console.error('Error al buscar artículos:', error);
        showError('Error al buscar artículos');
    }
};



// Manejar clics en los tí­tulos de artículos en los resultados de 
// búsqueda para mostrar el detalle del artículo
searchResultsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('article-title')) {
        const articleId = event.target.dataset.id;
        showArticleDetails(articleId);
    }
});


// Manejar el evento de búsqueda al hacer clic en el botón de 
// búsqueda (el icono de la lupa lo hemos incluído como un botón)
searchButton.addEventListener('click', () => {
    const query = searchBox.value.trim();
    if (query) {
        searchArticles(query);
    }
});


// Manejar el evento de búsqueda al presionar la tecla "Enter" en la caja de búsqueda
searchBox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = searchBox.value.trim();
        if (query) {
            searchArticles(query);
        }
    }
});

// Botón para volver al listado de artículos
document.getElementById("back-to-list").addEventListener('click', () => {
    showSection(sectionArticles);
    loadArticles(currentPage);
});


// Manejar navegación de paginación
document.getElementById("first-page").addEventListener('click', () => loadArticles());
document.getElementById("prev-page").addEventListener('click', () => {
    if (currentPage > 1) loadArticles(currentPage - 1);
});
document.getElementById("next-page").addEventListener('click', () => {
    if (currentPage < totalPages) loadArticles(currentPage + 1);
});
document.getElementById("last-page").addEventListener('click', () => loadArticles(totalPages));


// Mostrar la sección correspondiente al hacer clic en el menú
document.getElementById("menu-list").addEventListener('click', () => {
    showSection(sectionArticles);
    loadArticles(currentPage);
});
document.getElementById("menu-create").addEventListener('click', () => {
    showSection(sectionNewArticle);
});


// Cargar artículos al inicio
loadArticles();
showSection(sectionArticles);
});
