'use server'
import { getSession } from './session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function login(prevState: { error: string } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!result[0] || !(await bcrypt.compare(password, result[0].passwordHash))) {
    return { error: 'Invalid email or password' }
  }

  const session = await getSession()
  session.userId = result[0].id
  session.email = result[0].email
  session.name = result[0].name
  session.role = result[0].role
  session.isLoggedIn = true
  await session.save()

  if (result[0].role === 'admin') redirect('/admin')
  redirect('/board')
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/login')
}
