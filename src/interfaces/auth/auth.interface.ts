/** user's role */
export type Role = 'guest' | 'admin'

export interface LoginDto {
    userNameOrEmailAddress: string
    password: string
    rememberMe: boolean
}

export interface LoginResult {
    token?: string
    user?: any
}

export interface LogoutDto {
    token: string
}

export interface LogoutResult {}
