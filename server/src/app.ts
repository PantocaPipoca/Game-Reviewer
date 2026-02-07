import express from 'express'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Health check
app.get('/health', (_, res) => res.json({status: 'ok'}))

export default app