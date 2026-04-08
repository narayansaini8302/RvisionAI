const app = require('./src/app')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 5000

// Connect to MongoDB (without deprecated options)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB Atlas')
    console.log('📡 Database:', mongoose.connection.db.databaseName)
    
    // Start server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    })
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('Please check your MONGO_URI in .env file')
    process.exit(1)
})