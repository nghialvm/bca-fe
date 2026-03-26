import { useSelector } from 'react-redux'
import { Navigate, Route } from 'react-router-dom'

import RouteGuard from '@/components/guards/RouteGuard'
import { SITE_ROLES } from '@/constants/role'
import MainLayout from '@/layouts/MainLayout'
import NotAuthenticatedLayout from '@/layouts/NotAuthenticatedLayout'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminManageCvTemplatePage from '@/pages/admin/AdminManageCvTemplatePage'
import AdminManageJobPage from '@/pages/admin/AdminManageJobPage'
import AdminManageJobPositionPage from '@/pages/admin/AdminManageJobPositionPage'
import AdminManageLogPage from '@/pages/admin/AdminManageLogPage'
import AdminManageNotificationPage from '@/pages/admin/AdminManageNotificationPage'
import AdminManageOrganizationPage from '@/pages/admin/AdminManageOrganizationPage'
import AdminManagePermissionPage from '@/pages/admin/AdminManagePermissionPage'
import AdminManageUserPage from '@/pages/admin/AdminManageUserPage'
import AdminProfilePage from '@/pages/admin/AdminProfilePage'
import AdminReportPage from '@/pages/admin/AdminReportPage'
import CandidateApplicationPage from '@/pages/candidate/CandidateApplicationPage'
import CandidateDashboardPage from '@/pages/candidate/CandidateDashboardPage'
import CandidateJobPage from '@/pages/candidate/CandidateJobPage'
import CandidateProfilePage from '@/pages/candidate/CandidateProfilePage'
import LoginPage from '@/pages/commons/LoginPage'
import RegisterPage from '@/pages/commons/RegisterPage'
import EmployerDashboardPage from '@/pages/employer/EmployerDashboardPage'
import EmployerManageCandidatePage from '@/pages/employer/EmployerManageCandidatePage'
import EmployerManageCommunicationPage from '@/pages/employer/EmployerManageCommunicationPage'
import EmployerManageInterviewPage from '@/pages/employer/EmployerManageInterviewPage'
import EmployerManageJobPage from '@/pages/employer/EmployerManageJobPage'
import EmployerProfilePage from '@/pages/employer/EmployerProfilePage'
import EmployerReportPage from '@/pages/employer/EmployerReportPage'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

import { PATHS } from './path'

const HomeRedirect = () => {
    const user = useSelector((state: any) => state.auth.user)

    return <Navigate to={getDefaultPathByRole(getSiteRole(user))} replace />
}

const AppRouter = [
    <Route element={<NotAuthenticatedLayout />} key="not-auth">
        <Route path={PATHS.LOGIN} element={<LoginPage />} />
        <Route path={PATHS.REGISTER} element={<RegisterPage />} />
    </Route>,
    <Route
        element={
            <RouteGuard>
                <HomeRedirect />
            </RouteGuard>
        }
        path={PATHS.HOME}
        key="home"
    />,
    <Route
        element={
            <RouteGuard allowedRoles={[SITE_ROLES.ADMIN]}>
                <MainLayout />
            </RouteGuard>
        }
        key="admin"
    >
        <Route path={PATHS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
        <Route path={PATHS.ADMIN_PROFILE} element={<AdminProfilePage />} />
        <Route
            path={PATHS.ADMIN_MANAGE_USERS}
            element={<AdminManageUserPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_PERMISSIONS}
            element={<AdminManagePermissionPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_ORGANIZATIONS}
            element={<AdminManageOrganizationPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_NOTIFICATIONS}
            element={<AdminManageNotificationPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_LOGS}
            element={<AdminManageLogPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_JOBS}
            element={<AdminManageJobPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_JOB_POSITIONS}
            element={<AdminManageJobPositionPage />}
        />
        <Route
            path={PATHS.ADMIN_MANAGE_CV_TEMPLATES}
            element={<AdminManageCvTemplatePage />}
        />
        <Route path={PATHS.ADMIN_REPORT} element={<AdminReportPage />} />
    </Route>,
    <Route
        element={
            <RouteGuard allowedRoles={[SITE_ROLES.EMPLOYER]}>
                <MainLayout />
            </RouteGuard>
        }
        key="employer"
    >
        <Route
            path={PATHS.EMPLOYER_DASHBOARD}
            element={<EmployerDashboardPage />}
        />
        <Route
            path={PATHS.EMPLOYER_MANAGE_JOBS}
            element={<EmployerManageJobPage />}
        />
        <Route
            path={PATHS.EMPLOYER_MANAGE_INTERVIEWS}
            element={<EmployerManageInterviewPage />}
        />
        <Route
            path={PATHS.EMPLOYER_MANAGE_COMMUNICATIONS}
            element={<EmployerManageCommunicationPage />}
        />
        <Route
            path={PATHS.EMPLOYER_MANAGE_CANDIDATES}
            element={<EmployerManageCandidatePage />}
        />
        <Route path={PATHS.EMPLOYER_REPORT} element={<EmployerReportPage />} />
        <Route
            path={PATHS.EMPLOYER_PROFILE}
            element={<EmployerProfilePage />}
        />
    </Route>,
    <Route
        element={
            <RouteGuard allowedRoles={[SITE_ROLES.CANDIDATE]}>
                <MainLayout />
            </RouteGuard>
        }
        key="candidate"
    >
        <Route
            path={PATHS.CANDIDATE_DASHBOARD}
            element={<CandidateDashboardPage />}
        />
        <Route path={PATHS.CANDIDATE_JOBS} element={<CandidateJobPage />} />
        <Route
            path={PATHS.CANDIDATE_APPLICATIONS}
            element={<CandidateApplicationPage />}
        />
        <Route
            path={PATHS.CANDIDATE_PROFILE}
            element={<CandidateProfilePage />}
        />
    </Route>,
]

export default AppRouter
