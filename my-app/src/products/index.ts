import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const productsRoutes = new Hono()
const createProductSchema = z.object({
  product_id: z.string("Null_ID").length(5),
  p_name: z.string("ชื่ิอสินค้า").min(5,"ชื่อต้องมีความยาวอย่างน้อย5ตัวอักษร"),
  sell_price : z.number("ขาดราคาขาย"),
  cost_price : z.number("ขาดราคาต้นทุน"),
  note : z.string().optional()
})

productsRoutes.get('/', (c) => {
  return c.json({ message: 'List of Products'})
})

productsRoutes.post('/',
    zValidator('json', createProductSchema)
    , async (c) => {
        const body = await c.req.json()
        return c.json({ message: 'A Product created', data: body})
    }
)

export default productsRoutes