const socket = io()

// Seleccionar un único contenedor
const listaProductos = document.querySelector('.product-list')

// Obtener el cartId desde el atributo data
const shopCart = document.querySelector('.shop-cart')

// Escuchar lista de productos desde el servidor
socket.on('lista_productos', (products) => {
   listaProductos.innerHTML = ''  // limpiar lista

   products.forEach(product => {
      const card = document.createElement('div')
      card.classList.add('product-card')

      card.innerHTML = `   
         <img src="/${product.thumbnails}">
         <h2>${product.title}</h2> 
         <section> 
            <small> ${product.description} </small> 
            <span> $${product.price} </span>
            <button data-pid="${product._id}">Agregar al carrito</button>
         </section>
      `

      listaProductos.appendChild(card)
   })

   // Agregar listener a los botones
   listaProductos.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
         addToCart(button.dataset.pid)
      })
   })
})

// Función para agregar un producto al carrito
async function addToCart(pid) {
   // Crear carrito si no existe
   if (!shopCart.dataset.cartId) {
      console.log("No tengo carrito, creando uno...")

      const res = await fetch("/api/carts/", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ products: [] })
      });

      const data = await res.json();
      if (data.status !== "success") {
         console.error("Error al crear carrito:", data)
         return
      }

      // id del carrito se lo asigno al div
      const cartId = data.payload._id
      shopCart.dataset.cartId = cartId
      console.log("Carrito creado con ID:", cartId)
   }

   // agregar producto al carrito existente
   const cartId = shopCart.dataset.cartId

   const res = await fetch(`/api/carts/${cartId}/product/${pid}`, {
      method: "POST"
   })

   const data = await res.json()

   if (data.status === "success") {
      alert("Producto agregado al carrito!")
   } else {
      alert(`Error: ${data.error}`)
   }
}