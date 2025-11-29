import { Router } from 'express'
import { ProductManager } from '../ProductManager.js'

export default function productsRouter(io) {
   const productManager = new ProductManager(io)
   const route = Router()

   route.get('/', async (req, res) => {
      const result = await productManager.getProducts(req.query)
      if (result.status === "error") return res.status(500).json(result)
      res.status(200).json(result)
   })

   route.get('/:pid', async (req, res) => {
      const { pid } = req.params
      const result = await productManager.getProductById(pid)
      if (result.status === "error") return res.status(400).json(result)
      res.status(200).json(result)
   })

   route.post('/', async (req, res) => {
      const result = await productManager.addProduct(req.body)
      if (result.status === "error") return res.status(400).json(result)
      res.status(201).json(result)
   })

   route.put("/:pid", async (req, res) => {
      const { pid } = req.params
      const result = await productManager.updateProduct(pid, req.body)
      if (result.status === "error") return res.status(400).json(result)
      res.status(200).json(result)
   })

   route.delete("/:pid", async (req, res) => {
      const { pid } = req.params
      const result = await productManager.deleteProduct(pid)
      if (result.status === "error") return res.status(400).json(result)
      res.status(200).json(result)
   })

   return route
}