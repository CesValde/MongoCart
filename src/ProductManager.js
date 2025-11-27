import mongoose from "mongoose"
import { productsModel } from './models/products.model.js'

export class ProductManager {
   // Obtiene los productos de la base de datos
   async getProducts(req, res) {
      try {
         // ?page=2&limit=5&category=tecnologia&sort=asc
         const {
            limit = 10,
            page = 1,
            category,
            status,
            query,
            sort
         } = req.query

         // usamos {}, porque Mongo espera un objeto
         const filter = {}
         if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
         if (status !== undefined) filter.status = status === 'true'

         // $or: cualquiera de los campos puede coincidir
         // $regex y $options: "i" permiten buscar coincidencias parciales sin importar mayúsculas/minúsculas
         if (query) {
            filter.$or = [
               { title: { $regex: query, $options: "i" } },
               { description: { $regex: query, $options: "i" } },
               { category: { $regex: query, $options: "i" } }
            ]
         }

         const options = {
            page,
            limit,
            lean: true,
            sort: sort === "asc" ? { price: 1 } :
               sort === "desc" ? { price: -1 } : {}
         }

         const result = await productsModel.paginate(filter, options)

         res.status(200).json({
            status: "Success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null
         })
      } catch (error) {
         console.log(`Cannot get the products ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // retorna un producto en base a su id
   async getProductById(req, res) {
      try {
         const { pid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "Invalid product ID format" })
         }

         const product = await productsModel.findById(pid)
         if (!product) return res.status(404).json({ error: `Product with id: ${pid} Not Found` })
         res.status(200).json({ result: "Success", payload: product })
      } catch (error) {
         console.log(`Cannot get the product ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // agrega un objeto producto nuevo a la coleccion
   async addProduct(req, res) {
      try {
         let data = req.body

         // Si viene un solo objeto, lo convertimos en array para procesarlo igual
         if (!Array.isArray(data)) {
            data = [data]
         }

         // Validación simple
         for (const product of data) {
            const { title, description, code, price, status, stock, category, thumbnails } = product
            if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
               return res.status(400).json({ error: "Missing values" })
            }
         }

         const result = await productsModel.insertMany(data)
         res.status(201).json({
            result: "Product add",
            inserted: result.length,
            payload: result
         })

         // meter aca el emit creoooooo

      } catch (error) {
         console.log(`Cannot add the product ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // modifica un producto 
   async updateProduct(req, res) {
      try {
         const { pid } = req.params
         const productReplace = { ...req.body }
         delete productReplace._id

         if (!productReplace.title
            || !productReplace.description
            || !productReplace.code
            || !productReplace.price
            || !productReplace.status
            || !productReplace.stock
            || !productReplace.category
            || !productReplace.thumbnails
         ) {
            return res.status(400).json({ error: "Missing values" })
         }

         const result = await productsModel.updateOne(
            { _id: pid },
            { $set: productReplace }
         )

         res.status(200).json({ status: "Product Update", payload: result })

         // meter aca el emit creoooooo

      } catch (error) {
         console.error(`Cannot update the product ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }

   // elimina un producto
   async deleteProduct(req, res) {
      try {
         const { pid } = req.params

         // Validamos ID de Mongo
         if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "Invalid product ID format" })
         }

         const product = await productsModel.findById(pid)
         if (!product) return res.status(404).json({ error: `Product with id: ${pid} Not Found` })

         await productsModel.deleteOne({ _id: pid })
         res.status(200).json({ result: "Product Delete", payload: product })

         // meter el emit antes del res 

      } catch (error) {
         console.error(`Cannot delete the product ${error}`)
         res.status(500).json({ error: "Internal server error" })
      }
   }
}