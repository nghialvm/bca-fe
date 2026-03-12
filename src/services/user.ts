import { AxiosResponse } from 'axios'

import { USER_API } from '@/constants/api'
import { User } from '@/interfaces/user/user.interface'
import http from '@/services/http'

export class UserService {
    async getCurrentUser(): Promise<AxiosResponse<User>> {
        return await http.get(USER_API.GET_CURRENT_USER)
    }
}

export default new UserService()
