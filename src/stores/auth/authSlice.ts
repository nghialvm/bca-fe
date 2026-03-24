import { createSlice } from '@reduxjs/toolkit'

import { CREDENTIALS } from '@/constants/storage'
import { User } from '@/interfaces/user/user.interface'
import {
    getLocalStorage,
    putLocalStorage,
    removeLocalStorage,
} from '@/utils/storage'

import { getCurrentUserAction, loginAction, logoutAction } from './authAction'

const initialUser: User = {}

const initialState: any = {
    isAuthenticated: Boolean(getLocalStorage(CREDENTIALS.IS_LOGIN)) || false,
    justLoggedOut: false,
    user: getLocalStorage(CREDENTIALS.USER_INFO)
        ? JSON.parse(getLocalStorage(CREDENTIALS.USER_INFO) as string)
        : initialUser,
}

const clearAuthState = (state: any) => {
    state.isAuthenticated = false
    state.user = null
    removeLocalStorage(CREDENTIALS.IS_LOGIN)
    removeLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
    removeLocalStorage(CREDENTIALS.USER_INFO)
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            clearAuthState(state)
            state.justLoggedOut = true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAction.fulfilled, (state, action: any) => {
                state.justLoggedOut = false
                if (action.payload?.token) {
                    putLocalStorage(
                        CREDENTIALS.AUTHENTICATION_TOKEN,
                        action.payload.token
                    )
                }
            })
            .addCase(loginAction.rejected, (state, action) => {
                clearAuthState(state)
                state.justLoggedOut = false
            })
            .addCase(getCurrentUserAction.fulfilled, (state, action: any) => {
                state.isAuthenticated = true
                state.justLoggedOut = false
                state.user = action.payload
                putLocalStorage(
                    CREDENTIALS.USER_INFO,
                    JSON.stringify(action.payload)
                )
                putLocalStorage(CREDENTIALS.IS_LOGIN, 'true')
            })
            .addCase(getCurrentUserAction.rejected, (state) => {
                clearAuthState(state)
                state.justLoggedOut = false
            })
            .addCase(logoutAction.fulfilled, (state) => {
                clearAuthState(state)
                state.justLoggedOut = true
            })
    },
})

export const { logout } = authSlice.actions

export default authSlice.reducer
