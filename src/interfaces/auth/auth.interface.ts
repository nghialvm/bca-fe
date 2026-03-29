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

export interface ChangePasswordDto {
    currentPassword: string
    newPassword: string
}

export interface ForgotPasswordDto {
    email: string
}

export interface ResetPasswordDto {
    userId: string
    token: string
    newPassword: string
}

export interface RegisterDto {
    userName: string
    emailAddress: string
    password: string
    appName: string
}

export interface RegisterResult {
    [key: string]: unknown
}

export interface LogoutDto {
    token: string
}

export interface LogoutResult {}
