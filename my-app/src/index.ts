import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import userRoutes from './users/index.js'
import roleRoutes from './roles/index.js'
import productsRoutes from './products/index.js'

//import database
import db from './db/index.js'

const app = new Hono()


app.route('/api/users',userRoutes)
app.route('api/roles',roleRoutes)
app.route('api/products', productsRoutes)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
