import { useEffect } from 'react'

import { ConfigProvider, theme } from 'antd'

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import NotFound from '@/pages/commons/NotFound'
import AppRouter from '@/routers/router'
import { initializeAntiforgeryToken } from '@/services/http'

function App() {
    const { defaultAlgorithm } = theme

    useEffect(() => {
        void initializeAntiforgeryToken().catch((error) => {
            console.error('Failed to initialize antiforgery token', error)
        })
    }, [])

    return (
        <ConfigProvider
            theme={{
                algorithm: defaultAlgorithm,
                token: {
                    colorPrimary: '#2F54EB',
                    colorInfo: '#2F54EB',
                    colorSuccess: '#166534',
                    colorWarning: '#b7791f',
                    colorBgLayout: '#f4f7fc',
                    borderRadius: 18,
                    fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                },
                components: {
                    Button: {
                        controlHeightLG: 46,
                    },
                    Card: {
                        borderRadiusLG: 24,
                    },
                    Input: {
                        controlHeightLG: 46,
                    },
                    Layout: {
                        bodyBg: '#f4f7fc',
                        siderBg: '#0d2f6f',
                        headerBg: '#ffffff',
                    },
                    Menu: {
                        itemBorderRadius: 14,
                        itemSelectedBg: 'rgba(47, 84, 235, 0.12)',
                        itemSelectedColor: '#2F54EB',
                        itemHoverColor: '#2F54EB',
                        itemActiveBg: 'rgba(47, 84, 235, 0.08)',
                    },
                    Table: {
                        headerBg: '#f4f8f5',
                    },
                },
            }}
        >
            <div>
                <>
                    <Router>
                        <Routes>
                            {AppRouter}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                </>
            </div>
        </ConfigProvider>
    )
}

export default App
