import { randomBytes , createHmac} from 'node:crypto'
import {db, eq} from '@repo/database'
import {usersTable} from '@repo/database/models/user' 
import {type CreateUserWithEmailAndPasswordInputType, createUserWithEmailAndPasswordInput} from './model'

class UserService {

  private async getUserByEmail(email: string) {
    const result =await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (!result || result.length === 0) return null
    return result[0]
  }
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const {fullName,email,password} = await createUserWithEmailAndPasswordInput.parseAsync(payload)

    // Check if user already exists
    const existingUserWithEmail = await this.getUserByEmail(email)
    if (existingUserWithEmail) throw new Error(`user with this email ${email} already exists`)
    // Generate salt and hash the password
    const salt = randomBytes(16).toString('hex')
    const hash = createHmac('sha256', salt).update(password).digest('hex')
    // Insert the new user into the database
    const userInsertResult = await db.insert(usersTable).values({
      fullName,
      email,
      password: hash,
      salt,
    }).returning({
      id: usersTable.id,
    })

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) throw new Error('There is issue while creating the user')

    return {
      id: String(userInsertResult[0].id)
    }
  }
}

export default UserService;