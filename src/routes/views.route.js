import { Router } from "express"
import { ProductManager } from "../ProductManager.js"
import { CartManager } from "../CartManager.js"

export default function viewsRouter(io) {
   const router = Router()
   const productManager = new ProductManager(io)
   const cartManager = new CartManager(io)

   // Página principal de productos
   router.get("/", async (req, res) => {
      const result = await productManager.getProducts()
      res.render("index", { products: result.payload, pagination: result })
   })

   // Vista de carrito
   router.get("/cart/:cid", async (req, res) => {
      const { cid } = req.params

      // Llamás al método de tu clase
      const result = await cartManager.getProductsCartById(cid)

      if (result.status !== "success") {
         return res.status(404).render("cart", {
            title: "Carrito no encontrado",
            error: result.error
         })
      }

      // Renderizás la vista pasándole los productos
      res.render("cart", {
         title: "Mi Carrito",
         cart: result.payload
      })
   })

   // Detalle de producto
   router.get("/:pid", async (req, res) => {
      const result = await productManager.getProductById(req.params.pid)
      if (result.status === "error") return res.status(404).send(result.error)
      res.render("productDetail", { product: result.payload })
   })

   return router
}