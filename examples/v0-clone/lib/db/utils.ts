import { hashSync } from 'bcrypt-ts'

export function generateHashedPassword(plainTextPassword: string): string {
  const saltRounds = 10
  return hashSync(plainTextPassword, saltRounds)
}
