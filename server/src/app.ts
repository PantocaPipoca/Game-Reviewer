import express from 'express'
import router from './routes/router.js'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/', router)

// Health check
app.get('/health', (_, res) => res.json({status: 'ok'}))

export default app