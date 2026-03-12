import 'antd/dist/reset.css'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import '@/configs/dayjs.config'

import App from './App'
import './assets/css/base.css'
import store from './stores'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    // @ts-ignore
    <Provider store={store}>
        <App />
    </Provider>
)
