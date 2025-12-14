import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { use } from 'hono/jsx'
import db from '../db/index.js'
import type { UserInfo } from 'node:os'
import { error } from 'node:console'

const userRoutes = new Hono()

type User = {
    id: number
    username : string
    firstname: string
    lastname : string
}

userRoutes.get('/', async(c) => {
    let sql = 'SELECT * FROM users'
    let stmt = db.prepare<[],User>(sql)
    let users :  User[] = stmt.all()
    return c.json({ message : 'List of Users', data : users})
})

userRoutes.get('/:id', (c) => {
    const { id } = c.req.param()
    let sql = 'SELECT * FROM users WHERE id = @id'
    let stmt = db.prepare<{id:string},User>(sql)
    let users =  stmt.get({id:id})

    if (!users){
        return c.json({message : `User not Found`}, 404)
    }

    return c.json({
        message : `User details for ID: ${id}`,
        data : users
    })
})

const createUserSchema = z.object({
    username: z.string("กรุณากรอกชื่อ")
        .min(5,"name must have more than 5 letters"),
    password : z.string("please enter password"),
    firstname : z.string('Please enter first name').optional(),
    lastname : z.string('Please enter lastname').optional(),
})

userRoutes.post('/',
    zValidator('json', createUserSchema, (result,c) =>{
        if (!result.success){
            return c.json({
                message: 'Validation Failed',
                errors : result.error.issues }, 400)
        }
    })
    , async (c) => {
        const body = await c.req.json<User>()
        let sql = `INSERT INTO users
            (username, password, firstname, lastname)
            VALUES(@username, @password, @firstname, @lastname);`
        
        let stmt = db.prepare<Omit<User,"id">>(sql)
        let result = stmt.run(body)

        if (result.changes === 0) {
            return c.json({ message: 'Falied to Creat user'},500)
        }
        let lastRowid = result.lastInsertRowid as number

        let sql2 = `SELECT * FROM users WHERE id = ?`
        let stmt2 = db.prepare<[number],User>(sql2)
        let newUser = stmt2.get(lastRowid)

        return c.json({ message: 'User created', data: newUser}, 201)
    }
)



export default userRoutes