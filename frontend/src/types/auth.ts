export interface User {
  id: string
  email: string
  name: string
  currency: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  currency?: string
}

export interface Token {
  access_token: string
  token_type: string
}
