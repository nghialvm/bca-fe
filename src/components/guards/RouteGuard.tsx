import React from 'react'

import { notification } from 'antd'

import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import { SiteRole } from '@/constants/role'
import { PATHS } from '@/routers/path'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

interface RouteGuardProps {
    children: React.ReactNode
    allowedRoles?: SiteRole[]
}

const RouteGuard = ({ children, allowedRoles }: RouteGuardProps) => {
    const isAuthenticated = useSelector(
        (state: any) => state.auth.isAuthenticated
    )
    const justLoggedOut = useSelector((state: any) => state.auth.justLoggedOut)
    const user = useSelector((state: any) => state.auth.user)
    const location = useLocation()

    if (!isAuthenticated) {
        if (!justLoggedOut) {
            notification.error({
                message: 'You are not logged in. Please sign in',
            })
        }
        return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />
    }

    const siteRole = getSiteRole(user)

    if (
        allowedRoles?.length &&
        (!siteRole || !allowedRoles.includes(siteRole))
    ) {
        notification.error({
            message: 'You do not have access to this site',
        })
        return (
            <Navigate
                to={getDefaultPathByRole(siteRole)}
                state={{ from: location }}
                replace
            />
        )
    }

    return <>{children}</>
}

export default RouteGuard
