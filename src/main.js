import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import './assets/styles/components.css'
import './assets/styles/sidebar.css'
import './assets/styles/auth.css'
import './assets/styles/dashboard.css'
import './assets/styles/accounts.css'
import './assets/styles/transactions.css'
import './assets/styles/profile.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
