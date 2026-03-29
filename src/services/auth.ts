import axios from 'axios'

import { AUTH_API } from '@/constants/api'
import {
    ChangePasswordDto,
    ForgotPasswordDto,
    LoginDto,
    LoginResult,
    RegisterDto,
    RegisterResult,
    ResetPasswordDto,
} from '@/interfaces/auth/auth.interface'
import http, { getBackendBaseUrl } from '@/services/http'

export class AuthService {
    async login(payload: LoginDto): Promise<LoginResult> {
        return await http.post(AUTH_API.LOGIN, payload)
    }

    async register(payload: RegisterDto): Promise<RegisterResult> {
        return await http.post(AUTH_API.REGISTER, payload)
    }

    async changePassword(payload: ChangePasswordDto): Promise<void> {
        await http.post(AUTH_API.CHANGE_PASSWORD, payload)
    }

    async forgotPassword(payload: ForgotPasswordDto): Promise<void> {
        await http.post(AUTH_API.FORGOT_PASSWORD, payload)
    }

    async resetPassword(payload: ResetPasswordDto): Promise<void> {
        await http.post(AUTH_API.RESET_PASSWORD, payload)
    }

    async logout(): Promise<void> {
        await axios.get(`${getBackendBaseUrl()}${AUTH_API.LOGOUT}`, {
            withCredentials: true,
            headers: {
                Accept: 'text/html, application/xhtml+xml, */*',
            },
        })
    }
}

export default new AuthService()
