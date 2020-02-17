import { decode } from 'jsonwebtoken'

import { JwtToken } from './JwtToken'
import {JwtPayload} from "../../../../../project/c4-final-project-starter-code/backend/src/auth/JwtPayload";

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  return decodedJwt.sub
}

export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload;
  return decodedJwt.sub
}
