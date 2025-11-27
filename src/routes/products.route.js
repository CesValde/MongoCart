import { Router } from 'express'
/* import path from  */'path'
/* import { fileURLToPath } from 'url' */
import { ProductManager } from '../ProductManager.js'

/* const __filename = fileURLToPath(import.meta.url) */
/* const __dirname = path.dirname(__filename) */

/* const pathProduct = path.join(__dirname, '..', 'json', 'products.json') */
const productManager = new ProductManager()

const route = Router()
/* import { io } from '../app.js' */

// lista todos los productos de la base de datos.
route.get('/', productManager.getProducts)

// busca un producto por id
route.get('/:pid', productManager.getProductById)

// Debe agregar un nuevo producto con los siguientes campos:
// id: Number/String (No se manda desde el body, se autogenera para asegurar que nunca se repitan los ids).
// emite la lista de productos actualizada a los usuarios en linea
route.post('/', productManager.addProduct)

// Debe actualizar un producto por los campos enviados desde el body.  
// No se debe actualizar ni eliminar el id al momento de hacer la actualización.
// emite la lista de productos actualizada a los usuarios en linea
route.put("/:pid", productManager.updateProduct)

// Debe eliminar el producto con el pid indicado.
// emite la lista de productos actualizada a los usuarios en linea
route.delete("/:pid", productManager.deleteProduct)

export default route