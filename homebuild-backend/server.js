// server.js
require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

// Database Connection and Server Start
async function startServer() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with the database
    // Force sync in development to recreate tables
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();