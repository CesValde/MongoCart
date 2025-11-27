/* 
   Entrega Final
   1. Objetivos generales
   - Contarás con Mongo como sistema de persistencia principal ✅
   - Tendrás definidos todos los endpoints para poder trabajar con productos y carritos. 

   2. Objetivos específicos
   - Profesionalizar las consultas de productos con filtros, paginación y ordenamientos
   - Profesionalizar la gestión de carrito para implementar los últimos conceptos vistos.

   3. Formato
   Link al repositorio de Github, sin la carpeta de node_modules ✅

   4. Sugerencias
   - Permitir comentarios en el archivo
   - La lógica del negocio que ya tienes hecha no debería cambiar, sólo su persistencia.✅
   - Los nuevos endpoints deben seguir la misma estructura y lógica que hemos seguido. ✅

   5. Video explicativo entrega final: https://drive.google.com/file/d/1nQUXoZ7Oq0uGukaE13PL-E6dM77KjwNv/view?usp=sharing ✅

   6. Se debe entregar ✅
   - Con base en nuestra implementación actual de productos, modificar el método GET / para que cumpla con los siguientes puntos:
   - Deberá poder recibir por query params un limit (opcional), una page (opcional), un sort (opcional) y un query (opcional)
   - limit permitirá devolver sólo el número de elementos solicitados al momento de la petición, en caso de no recibir limit, éste será de 10.
   - page permitirá devolver la página que queremos buscar, en caso de no recibir page, ésta será de 1
   - query, el tipo de elemento que quiero buscar (es decir, qué filtro aplicar), en caso de no recibir query, realizar la búsqueda general
   - sort: asc/desc, para realizar ordenamiento ascendente o descendente por precio, en caso de no recibir sort, no realizar ningún ordenamiento

   7. Se debe entregar
   - El método GET deberá devolver un objeto con el siguiente formato: ✅

   {
      status:success/error
      payload: Resultado de los productos solicitados
      totalPages: Total de páginas
      prevPage: Página anterior
      nextPage: Página siguiente
      page: Página actual
      hasPrevPage: Indicador para saber si la página previa existe
      hasNextPage: Indicador para saber si la página siguiente existe.
      prevLink: Link directo a la página previa (null si hasPrevPage=false)
      nextLink: Link directo a la página siguiente (null si hasNextPage=false)
   }

   -  Se deberá poder buscar productos por categoría o por disponibilidad, y se deberá poder realizar un 
      ordenamiento de estos productos de manera ascendente o descendente por precio. ✅

   8. Se debe entregar
   - Además, agregar al router de carts los siguientes endpoints:
   - DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
   - PUT api/carts/:cid deberá actualizar todos los productos del carrito con un arreglo de productos.
   - PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
   - DELETE api/carts/:cid deberá eliminar todos los productos del carrito

   -+ Esta vez, para el modelo de Carts, en su propiedad products, el id de cada producto generado dentro del 
      array tiene que hacer referencia al modelo de Products. Modificar la ruta /:cid para que al traer todos los productos, 
      los traiga completos mediante un “populate”. De esta manera almacenamos sólo el Id, pero al solicitarlo podemos desglosar 
      los productos asociados.

   9. Se debe entregar
   - Modificar la vista index.handlebars en el router de views ‘/products’, creada en la pre-entrega anterior, para visualizar 
   todos los productos con su respectiva paginación. Además, cada producto mostrado puede resolverse de dos formas:

   - Llevar a una nueva vista con el producto seleccionado con su descripción completa, detalles de precio, categoría, e
   tc. Además de un botón para agregar al carrito.
   + Sugerencia de la ruta: “/products/:pid”.

   - Contar con el botón de “agregar al carrito” directamente, sin necesidad de abrir una página 
      adicional con los detalles del producto.
   - Además, agregar una vista en ‘/carts/:cid (cartId) para visualizar un carrito específico, 
      donde se deberán listar SOLO los productos que pertenezcan a dicho carrito.
*/

// express
import express from "express"

// mongoose 7
import mongoose from 'mongoose'

// routes
import realTimeProducts from "./routes/views.route.js"
import productsRoute from "./routes/products.route.js"
/* import cartsRoute from "./routes/carts.route.js" */

// express-handlebars
import handlebars from "express-handlebars"
import path from "path"
import { fileURLToPath } from "url"

// socket io
import { Server } from "socket.io"
import http from "http"

// filename toma el directorio del archivo ej: C:\Entrega2\src\app.js
// dirname toma la carpeta del directorio del archivo ej: C:\proyectos\miapp\src
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// servidor express
const app = express()
const server = http.createServer(app)
export const io = new Server(server)
const PORT = 8080
const URL = "mongodb+srv://valderramaCesar_db:Valde$.88@cluster0.o1b7cwr.mongodb.net/MongoCart?appName=Cluster0"

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine()) // define cómo procesar los .handlebars
app.set("view engine", "handlebars") // define qué motor usar, en este caso handlebars
app.set("views", path.join(__dirname, "views")) // define dónde están las vistas

// Servir archivos estáticos (como JS, CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, "public")))

// middleware para poder trabajar con datos JSON
app.use(express.json())

// Class
import { ProductManager } from "./ProductManager.js"
const pathProduct = path.join(__dirname, "json", "products.json")
const productManager = new ProductManager(pathProduct)

async function connectMongoose() {
   try {
      await mongoose.connect(URL)
      console.log("Conectado a MongoDB");
   } catch (error) {
      console.error(`Error conectando a MongoDB: ${error}`);
   }
}
connectMongoose()


// iniciar el servidor
server.listen(PORT, () => {
   console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`)
})

// ruta principal
app.get("/", (req, res) => {
   res.send("Bienvenido a MongoCart !")
})

// rutas /api/products
app.use("/api/products", productsRoute)


// rutas /api/carts
/* app.use("/api/carts", cartsRoute) */


// renderiza los productos en tiempo real
app.use("/realtimeproducts", realTimeProducts)

io.on("connection", (socket) => {
   // emitir la coleccion de productos a todos los sockets
   const products = productManager.getProducts()
   socket.emit("lista_productos", products)
})