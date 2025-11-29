import mongoose from "mongoose"
import { cartsModel } from "./models/carts.model.js"
import { productsModel } from "./models/products.model.js"

export class CartManager {
   constructor(io) {
      this.io = io
   }

   // Obtiene todos los carritos
   async getCarts() {
      try {
         const result = await cartsModel.find()
         console.log("Carritos obtenidos:", result.length)
         return { status: "success", payload: result }
      } catch (error) {
         console.log(`Cannot get the carts ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Retorna los productos de un carrito por ID
   async getProductsCartById(cid) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid)) {
            console.log("Invalid cart ID format:", cid)
            return { status: "error", error: "Invalid cart ID format" }
         }

         const cart = await cartsModel.findById(cid).populate("products.product")
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         console.log(`Productos del carrito ${cid} obtenidos`)
         return { status: "success", payload: cart }
      } catch (error) {
         console.log(`Cannot get the cart ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Crea un nuevo carrito
   async createCart(cartData) {
      try {
         // Si no mandan nada → creo un carrito vacío
         if (!cartData || !Array.isArray(cartData.products)) {
            cartData = { products: [] }
         }

         const result = await cartsModel.create(cartData)
         return { status: "success", payload: result }
      } catch (error) {
         console.log(`Cannot create the cart ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Agrega un producto a un carrito
   async addProductCart(cid, pid) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            console.log("Invalid product or cart ID format")
            return { status: "error", error: "Invalid product/cart ID format" }
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         const product = await productsModel.findById(pid)
         if (!product) {
            console.log(`Product with id ${pid} Not Found`)
            return { status: "error", error: `Product with id: ${pid} Not Found` }
         }

         const index = cart.products.findIndex(p => String(p.product) === pid)
         if (index !== -1) {
            cart.products[index].quantity++
            console.log(`Product ${pid} quantity increased in cart ${cid}`)
         } else {
            cart.products.push({ product: pid, quantity: 1 })
            console.log(`Product ${pid} added to cart ${cid}`)
         }

         const updatedCart = await cart.save()
         this.io.emit('cart_updated', updatedCart) // evento global
         return { status: "success", payload: updatedCart }
      } catch (error) {
         console.log(`Cannot add the product ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Elimina un producto de un carrito
   async deleteProductCart(cid, pid) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            console.log("Invalid product or cart ID format")
            return { status: "error", error: "Invalid product/cart ID format" }
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         const index = cart.products.findIndex(p => String(p.product) === pid)
         if (index === -1) {
            console.log(`Product ${pid} not found in cart ${cid}`)
            return { status: "error", error: `Product ${pid} not found in cart` }
         }

         cart.products.splice(index, 1)
         await cart.save()
         console.log(`Product ${pid} removed from cart ${cid}`)
         return { status: "success", payload: cart }
      } catch (error) {
         console.log(`Cannot delete the product ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Actualiza todos los productos de un carrito
   async updateProductsCart(cid, newProducts) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid)) {
            console.log("Invalid cart ID format:", cid)
            return { status: "error", error: "Invalid cart ID format" }
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         if (!Array.isArray(newProducts)) {
            console.log("New products must be an array")
            return { status: "error", error: "Body must be an array of products" }
         }

         cart.products = newProducts
         await cart.save()
         console.log(`Cart ${cid} products updated`)
         return { status: "success", payload: cart }
      } catch (error) {
         console.log(`Cannot update products in cart ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Actualiza la cantidad de un producto específico
   async updateQuantity(cid, pid, quantity) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            console.log("Invalid product or cart ID format")
            return { status: "error", error: "Invalid product/cart ID format" }
         }

         if (typeof quantity !== "number" || quantity < 1) {
            console.log("Invalid quantity:", quantity)
            return { status: "error", error: "Quantity must be a positive number" }
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         const index = cart.products.findIndex(p => String(p.product) === pid)
         if (index === -1) {
            console.log(`Product ${pid} not found in cart ${cid}`)
            return { status: "error", error: `Product ${pid} not found in cart` }
         }

         cart.products[index].quantity = quantity
         await cart.save()
         console.log(`Product ${pid} quantity updated to ${quantity} in cart ${cid}`)
         return { status: "success", payload: cart }
      } catch (error) {
         console.log(`Cannot update product quantity ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }

   // Elimina todos los productos de un carrito
   async deleteAllProductsCart(cid) {
      try {
         if (!mongoose.Types.ObjectId.isValid(cid)) {
            console.log("Invalid cart ID format:", cid)
            return { status: "error", error: "Invalid cart ID format" }
         }

         const cart = await cartsModel.findById(cid)
         if (!cart) {
            console.log(`Cart with id ${cid} Not Found`)
            return { status: "error", error: `Cart with id: ${cid} Not Found` }
         }

         cart.products = []
         await cart.save()
         console.log(`All products removed from cart ${cid}`)
         return { status: "success", payload: cart }
      } catch (error) {
         console.log(`Cannot delete all products ${error}`)
         return { status: "error", error: "Internal server error" }
      }
   }
}
