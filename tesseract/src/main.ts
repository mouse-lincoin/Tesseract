import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { Loading } from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './assets/theme.css'

const app = createApp(App)
app.component('Loading', Loading)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { size: 'default' })
document.documentElement.classList.add('dark')
app.mount('#app')
