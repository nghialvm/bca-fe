import { AxiosResponse } from 'axios'

import { AUTH_API } from '@/constants/api'
import { LoginDto, LoginResult } from '@/interfaces/auth/auth.interface'
import http from '@/services/http'

export class AuthService {
    async login(payload: LoginDto): Promise<AxiosResponse<LoginResult>> {
        return await http.post(AUTH_API.LOGIN, payload)
    }
}

export default new AuthService()
