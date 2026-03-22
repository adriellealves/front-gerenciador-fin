import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Importa o roteador que acabamos de criar

const app = createApp(App)

app.use(router) // Pluga o roteador no Vue
app.mount('#app')
