import mongoose from "mongoose"
import { cartsModel } from "./models/carts.model.js"
import { productsModel } from "./models/products.model.js"

export class CartManager {
   constructor(productManager) {
      this.productManager = productManager
   }

   // Obtiene los carts de la base de datos
   async getCarts(req, res) {
      try {
         const result = await cartsModel.find()
         res.status(200).json({ status: "Success", payload: result })
      } catch (error) {
         console.log(`Cannot get the carts ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // retorna los productos de un carrito en base a su id 
   async getProductsCartById(req, res) {
      try {
         const { cid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "Invalid cart ID format" })
         }

         const cart = await cartsModel.findById(cid).populate("products.product")
         if (!cart) return res.status(404).json({ error: `Cart with id: ${cid} Not Found` })
         res.status(200).json({ result: "Success", payload: cart })
      } catch (error) {
         console.log(`Cannot get the cart ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // Crea un nuevo cart
   async createCart(req, res) {
      try {
         const { cartData } = req.body;

         if (!cartData?.products ||    
            !Array.isArray(cartData.products) ||
            cartData.products.length === 0 ||
            !cartData.products.every(p => p.product)  // recorre el array y asegura que cada objeto tenga su campo product lleno.
         ) {
            return res.status(400).json({ error: true, message: "You must include products as an array" })
         }

         const result = await cartsModel.create(cartData)
         res.status(201).json({ result: "Cart Create", payload: result })
      } catch (error) {
         console.log(`Cannot create the cart ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // agrega un producto al carrito seleccionado y retorna el carrito
   async addProductCart(req, res) {
      try {
         const { cid, pid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(pid) ||
            !mongoose.Types.ObjectId.isValid(cid)
         ) {
            return res.status(400).json({ error: "Invalid product/cart ID format" })
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) return res.status(404).json({ message: `Cart with id: ${cid} Not Found` })

         const product = await productsModel.findById(pid)
         if (!product) return res.status(404).json({ message: `Product with id: ${pid} Not Found` })

         // Buscar si el producto ya está en el carrito
         const index = cart.products.findIndex(
            (p) => p.product.toString() === pid
         )

         if (index !== -1) {
            // Si existe, aumento cantidad
            cart.products[index].quantity++
         } else {
            // Si no existe, lo agrego
            cart.products.push({ product: pid, quantity: 1 })
         }

         const updatedCart = await cart.save()
         return res.status(200).json({ result: "Product add to Cart", payload: updatedCart })
      } catch (error) {
         console.log(`Cannot add the products ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // elimina del carrito el producto seleccionado.
   async deleteProductCart(req, res) {
      try {
         const { cid, pid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(pid) ||
            !mongoose.Types.ObjectId.isValid(cid)
         ) {
            return res.status(400).json({ error: "Invalid product/cart ID format" })
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) return res.status(404).json({ message: `Cart with id: ${cid} Not Found` })

         // Busca el producto dentro del carrito
         const index = cart.products.findIndex(
            p => String(p.product) === String(pid)
         )

         if (index === -1) {
            return res.status(404).json({ message: `Product ${pid} not found in cart` })
         }

         // Eliminar producto del carrito
         cart.products.splice(index, 1)
         await cart.save()
         res.status(200).json({ message: "Product removed from cart", payload: cart })
      } catch (error) {
         console.error(`Cannot delete the product ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // actualiza todos los productos del carrito con un arreglo de productos.
   async updateProductsCart(req, res) {
      try {
         const { cid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(cid)) return res.status(400).json({ error: "Invalid cart ID format" })

         const cart = await cartsModel.findById(cid)
         if (!cart) return res.status(404).json({ message: `Cart with id: ${cid} Not Found` })

         const newProducts = req.body

         if (!Array.isArray(newProducts)) {
            return res.status(400).json({ error: "Body must be an array of products" })
         }

         // Validación simple de estructura
         for (const item of newProducts) {
            if (!item.product || !item.quantity) {
               return res.status(400).json({ error: "Each item must contain product and quantity" })
            }

            if (typeof item.quantity !== "number" || item.quantity <= 0) {
               return res.status(400).json({ error: "The quantity must be greater than 0" })
            }
         }

         // Reemplazar productos del carrito
         cart.products = newProducts
         await cart.save()
         res.status(200).json({ status: "Products updated successfully", payload: cart })
      } catch (error) {
         console.error(`Cannot update the products in the cart ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier 
   // cantidad pasada desde req.body
   async updateQuantity(req, res) {
      try {
         const { cid, pid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(pid) ||
            !mongoose.Types.ObjectId.isValid(cid)
         ) {
            return res.status(400).json({ error: "Invalid product/cart ID format" })
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) return res.status(404).json({ message: `Cart with id: ${cid} Not Found` })

         // Validar body
         const { quantity } = req.body
         if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be a positive number" })
         }

         // Busca el producto dentro del carrito
         const index = cart.products.findIndex(
            p => String(p.product) === String(pid)
         )

         if (index === -1) {
            return res.status(404).json({ message: `Product ${pid} not found in cart` })
         }

         // Actualizar cantidad
         cart.products[index].quantity = quantity

         // Guardar carrito actualizado
         await cart.save()
         res.status(200).json({ message: "Product quantity updated", payload: cart })
      } catch (error) {
         console.log(`Cannot update the product quantity ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // elimina todos los productos del carrito
   async deleteAllProductsCart(req, res) {
      try {
         const { cid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "Invalid cart ID format" })
         }
         const cart = await cartsModel.findById(cid)
         if (!cart) return res.status(404).json({ message: `Cart with id: ${cid} Not Found` })

         // Vaciar productos
         cart.products = []
         await cart.save()
         res.status(200).json({ message: "All products removed from cart", payload: cart })
      } catch (error) {
         console.error(`Cannot delete the products ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }
}