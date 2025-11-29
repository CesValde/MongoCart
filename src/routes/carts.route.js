import { Router } from 'express'
import { CartManager } from '../CartManager.js'

export default function cartsRouter(io) {
   const cartManager = new CartManager(io)
   const route = Router()

   route.get('/', async (req, res) => {
      const result = await cartManager.getCarts()
      if (result.status === "error") return res.status(500).json(result)
      res.json(result)
   })

   route.get('/:cid', async (req, res) => {
      const result = await cartManager.getProductsCartById(req.params.cid)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   route.post('/', async (req, res) => {
      const result = await cartManager.createCart(req.body)
      if (result.status === "error") return res.status(400).json(result)
      res.status(201).json(result)
   })

   route.post('/:cid/product/:pid', async (req, res) => {
      const result = await cartManager.addProductCart(req.params.cid, req.params.pid)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   route.delete('/:cid/products/:pid', async (req, res) => {
      const result = await cartManager.deleteProductCart(req.params.cid, req.params.pid)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   route.put('/:cid', async (req, res) => {
      const result = await cartManager.updateProductsCart(req.params.cid, req.body)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   route.put('/:cid/products/:pid', async (req, res) => {
      const { quantity } = req.body
      const result = await cartManager.updateQuantity(req.params.cid, req.params.pid, quantity)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   route.delete('/:cid', async (req, res) => {
      const result = await cartManager.deleteAllProductsCart(req.params.cid)
      if (result.status === "error") return res.status(400).json(result)
      res.json(result)
   })

   return route
}