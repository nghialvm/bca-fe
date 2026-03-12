/** user's role */
export type Role = 'guest' | 'admin'

export interface LoginDto {
    email: string
    password: string
    twoFactorCode: string
    twoFactorRecoveryCode: string
}

export interface LoginResult {
    token: string
    user: any
}

export interface LogoutDto {
    token: string
}

export interface LogoutResult {}
