import axios from 'axios'

import { CREDENTIALS } from '@/constants/storage'
import { removeLocalStorage } from '@/utils/storage'

const http = axios.create({
    withCredentials: true,
    baseURL:
        import.meta.env.VITE_APP_ROOT_API ||
        `http://${window.location.hostname}:8000/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})

http.interceptors.request.use(
    (config: any) => {
        // const accessToken = getLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
        // if (accessToken && config.headers) {
        //     config.headers['Authorization'] = `Bearer ${accessToken}`
        // }

        return config
    },
    (error: any) => {
        return Promise.reject(error)
    }
)

http.interceptors.response.use(
    (response: any) => {
        return response?.data
    },
    (error: any) => {
        if ([401, 403].includes(error?.response?.status)) {
            console.error(error?.response)
            removeLocalStorage(CREDENTIALS.IS_LOGIN)
            removeLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
            removeLocalStorage(CREDENTIALS.USER_INFO)
        }
        return Promise.reject(error)
    }
)

export default http
