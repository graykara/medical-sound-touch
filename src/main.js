import App from './App.svelte'
import { initStorage } from './lib/storage'

initStorage();

const app = new App({
  target: document.body
})

export default app
