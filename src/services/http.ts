import axios, { type InternalAxiosRequestConfig } from 'axios'

import { CREDENTIALS } from '@/constants/storage'
import { removeLocalStorage } from '@/utils/storage'

const rootApiBaseUrl =
    import.meta.env.VITE_APP_ROOT_API ||
    `http://${window.location.hostname}:8000/api`

const antiforgeryCookieName = 'XSRF-TOKEN'
const antiforgeryHeaderName = 'RequestVerificationToken'
const antiforgeryBootstrapPath = '/Abp/ApplicationConfigurationScript'

let antiforgeryInitializationPromise: Promise<void> | null = null

export const getBackendBaseUrl = () => {
    return rootApiBaseUrl.replace(/\/api\/?$/i, '')
}

const getAntiforgeryBootstrapUrl = () => {
    return `${getBackendBaseUrl()}${antiforgeryBootstrapPath}`
}

const getCookieValue = (name: string) => {
    if (typeof document === 'undefined') return ''

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
    )

    return match ? decodeURIComponent(match[1]) : ''
}

const isMutatingMethod = (method?: string) => {
    const normalizedMethod = (method || 'get').toUpperCase()

    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)
}

export const initializeAntiforgeryToken = async (force = false) => {
    if (!force && getCookieValue(antiforgeryCookieName)) {
        return
    }

    if (!force && antiforgeryInitializationPromise) {
        return await antiforgeryInitializationPromise
    }

    antiforgeryInitializationPromise = axios
        .get(getAntiforgeryBootstrapUrl(), {
            withCredentials: true,
            responseType: 'text',
            headers: {
                Accept: 'application/javascript, text/plain, */*',
            },
        })
        .then(() => undefined)
        .finally(() => {
            antiforgeryInitializationPromise = null
        })

    return await antiforgeryInitializationPromise
}

const http = axios.create({
    withCredentials: true,
    baseURL: rootApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
})

http.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // const accessToken = getLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
        // if (accessToken && config.headers) {
        //     config.headers['Authorization'] = `Bearer ${accessToken}`
        // }

        if (isMutatingMethod(config.method)) {
            // ABP binds antiforgery tokens to the current claims principal.
            // Refresh before every mutating request so tokens issued pre-login
            // or for a previous user are not reused.
            await initializeAntiforgeryToken(true)

            const token = getCookieValue(antiforgeryCookieName)

            if (token) {
                config.headers.set(antiforgeryHeaderName, token)
            }
        }

        return config
    },
    (error: unknown) => {
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
