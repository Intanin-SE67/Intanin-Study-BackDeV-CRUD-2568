import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js'
import { da } from 'zod/v4/locales'

const roleRoutes = new Hono()

type Roles = {
    id: number
    name : string
}

roleRoutes.get('/', async(c) => {
    let sql = 'SELECT * FROM roles'
    let stmt = db.prepare<[],Roles>(sql)
    let users :  Roles[] = stmt.all()
    return c.json({ message : 'List of Roles', data : users})
})

roleRoutes.get('/:id', (c) => {
    const { id } = c.req.param()
    let sql = 'SELECT * FROM roles WHERE id = @id'
    let stmt = db.prepare<{id:string},Roles>(sql)
    let roles =  stmt.get({id:id})

    if (!roles){
        return c.json({message : `Role not Found`}, 404)
    }

    return c.json({
        message : `Role details for ID: ${id}`,
        data : roles
    })
})

const createRoleSchema = z.object({
    name : z.string("Please enter Role's Names")
})

roleRoutes.post('/',
    zValidator('json', createRoleSchema, (result,c) =>{
        if (!result.success){
            return c.json({
                message: 'Validation Failed',
                errors : result.error.issues }, 400)
        }
    })
    , async (c) => {
        const body = await c.req.json<Roles>()
        let sql = `INSERT INTO roles
            (name)
            VALUES(@name);`
        
        let stmt = db.prepare<Omit<Roles,"id">>(sql)
        let result = stmt.run(body)

        if (result.changes === 0) {
            return c.json({ message: 'Falied to create role'},500)
        }
        let lastRowid = result.lastInsertRowid as number

        let sql2 = `SELECT * FROM roles WHERE id = ?`
        let stmt2 = db.prepare<[number],Roles>(sql2)
        let newUser = stmt2.get(lastRowid)

        return c.json({ message: 'Role created', data: newUser}, 201)
    }
)



roleRoutes.delete('/:name', async (c) => {
  const { name } = c.req.param()
  if (!name || !name.trim()) {
    return c.json({ message: 'Role name is required' }, 400)
  }

  const sql = `DELETE FROM roles WHERE name = @name;`
  const stmt = db.prepare(sql)

  try {
    const result = stmt.run({ name })
    if (result.changes === 0) {
      return c.json({ message: 'Role not found' }, 404)
    }
    return c.json({ message: 'Role deleted' }, 200)
  } catch (err) {
    console.error('Delete error:', err)
    return c.json({ message: 'Failed to delete role' }, 500)
  }
})


export default roleRoutes
