import { createSlice } from '@reduxjs/toolkit'

import { CREDENTIALS } from '@/constants/storage'
import { User } from '@/interfaces/user/user.interface'
import {
    getLocalStorage,
    putLocalStorage,
    removeLocalStorage,
} from '@/utils/storage'

import { getCurrentUserAction, loginAction } from './authAction'

const initialUser: User = {}

const initialState: any = {
    isAuthenticated: Boolean(getLocalStorage(CREDENTIALS.IS_LOGIN)) || false,
    user: getLocalStorage(CREDENTIALS.USER_INFO)
        ? JSON.parse(getLocalStorage(CREDENTIALS.USER_INFO) as string)
        : initialUser,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false
            state.user = null
            removeLocalStorage(CREDENTIALS.IS_LOGIN)
            removeLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
            removeLocalStorage(CREDENTIALS.USER_INFO)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAction.fulfilled, (state, action: any) => {
                if (action.payload?.token) {
                    putLocalStorage(
                        CREDENTIALS.AUTHENTICATION_TOKEN,
                        action.payload.token
                    )
                }
            })
            .addCase(loginAction.rejected, (state, action) => {
                state.isAuthenticated = false
                state.user = null
                removeLocalStorage(CREDENTIALS.IS_LOGIN)
                removeLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
                removeLocalStorage(CREDENTIALS.USER_INFO)
            })
            .addCase(getCurrentUserAction.fulfilled, (state, action: any) => {
                state.isAuthenticated = true
                state.user = action.payload
                putLocalStorage(
                    CREDENTIALS.USER_INFO,
                    JSON.stringify(action.payload)
                )
                putLocalStorage(CREDENTIALS.IS_LOGIN, 'true')
            })
            .addCase(getCurrentUserAction.rejected, (state) => {
                state.isAuthenticated = false
                state.user = null
                removeLocalStorage(CREDENTIALS.IS_LOGIN)
                removeLocalStorage(CREDENTIALS.AUTHENTICATION_TOKEN)
                removeLocalStorage(CREDENTIALS.USER_INFO)
            })
    },
})

export const { logout } = authSlice.actions

export default authSlice.reducer
