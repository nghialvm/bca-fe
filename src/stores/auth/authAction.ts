import { createAsyncThunk } from '@reduxjs/toolkit'

import { AUTH_API, USER_API } from '@/constants/api'
import { LoginDto } from '@/interfaces/auth/auth.interface'
import AuthService from '@/services/auth'
import UserService from '@/services/user'

export const loginAction = createAsyncThunk(
    AUTH_API.LOGIN,
    async (credentials: LoginDto, { rejectWithValue }) => {
        return await AuthService.login(credentials)
    }
)

export const getCurrentUserAction = createAsyncThunk(
    USER_API.GET_CURRENT_USER,
    async (_, { rejectWithValue }) => {
        return await UserService.getCurrentUser()
    }
)

export const logoutAction = createAsyncThunk(AUTH_API.LOGOUT, async () => {
    try {
        await AuthService.logout()
        return { serverLogoutSucceeded: true }
    } catch (error) {
        console.warn(
            'Server logout failed, falling back to local logout.',
            error
        )
        return { serverLogoutSucceeded: false }
    }
})
