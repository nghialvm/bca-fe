import { ConfigProvider, theme } from 'antd'

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import NotFound from '@/pages/commons/NotFound'
import AppRouter from '@/routers/router'

function App() {
    const { defaultAlgorithm } = theme

    return (
        <ConfigProvider
            theme={{
                algorithm: defaultAlgorithm,
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
