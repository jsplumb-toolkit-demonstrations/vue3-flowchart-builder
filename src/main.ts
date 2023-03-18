import { createApp } from 'vue'
import App from './App.vue'

import { JsPlumbToolkitVue3Plugin } from "@jsplumbtoolkit/browser-ui-vue3"

import service from "./service"

const app = createApp(App)
app.use(JsPlumbToolkitVue3Plugin, {})

app.provide("service", service)

app.mount('#app')
