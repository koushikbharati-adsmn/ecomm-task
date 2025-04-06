import bcrypt from 'bcryptjs'

export const verifyPassword = async (
  inputPassword: string,
  storedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, storedPassword)
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}
