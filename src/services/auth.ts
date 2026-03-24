import axios from 'axios'

import { AUTH_API } from '@/constants/api'
import {
    LoginDto,
    LoginResult,
    RegisterDto,
    RegisterResult,
} from '@/interfaces/auth/auth.interface'
import http, { getBackendBaseUrl } from '@/services/http'

export class AuthService {
    async login(payload: LoginDto): Promise<LoginResult> {
        return await http.post(AUTH_API.LOGIN, payload)
    }

    async register(payload: RegisterDto): Promise<RegisterResult> {
        return await http.post(AUTH_API.REGISTER, payload)
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
