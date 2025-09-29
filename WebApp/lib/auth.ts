import jwt from 'jsonwebtoken'

const SECRET = process.env.AUTH_SECRET || 'change_this_secret'
export const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30 * 6 // 6 months

export function signToken(payload: Record<string, any>, expiresInSeconds = TOKEN_LIFETIME_SECONDS) {
  return jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: expiresInSeconds })
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as any
    return decoded
  } catch (err) {
    return null
  }
}
