import { Router } from 'express'

import { ProductManager } from '../ProductManager.js'
import { CartManager } from '../CartManager.js'

const productManager = new ProductManager()
const cartManager = new CartManager(productManager)
const route = Router()

// Lista todos los carritos de la base de datos
route.get('/', cartManager.getCarts)

// Debe listar los productos que pertenecen al carrito con el cid proporcionado.
route.get('/:cid', cartManager.getProductsCartById)

// Debe crear un nuevo carrito 
route.post('/', cartManager.createCart)

/* 
Debe agregar el producto al arreglo products del carrito seleccionado, utilizando el siguiente formato:
product: Solo debe contener el ID del producto.
quantity: Debe contener el número de ejemplares de dicho producto (se agregará de uno en uno).
Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho producto.
*/
route.post('/:cid/product/:pid', cartManager.addProductCart)

// deberá eliminar del carrito el producto seleccionado.
route.delete('/:cid/products/:pid', cartManager.deleteProductCart)

// deberá actualizar todos los productos del carrito con un arreglo de productos.
// [{ "product": "69278fefde6bcabc9dbf2300", "quantity": 0 }]
route.put('/:cid', cartManager.updateProductsCart)

// deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier 
// cantidad pasada desde req.body -> { quantity: 5 }
route.put('/:cid/products/:pid', cartManager.updateQuantity)

// deberá eliminar todos los productos del carrito
route.delete('/:cid', cartManager.deleteAllProductsCart)

export default route