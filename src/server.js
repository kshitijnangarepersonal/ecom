const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║        🛍️  DUSK COMMERCE API  🛍️        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  🚀  Running on  http://localhost:${PORT}  ║`);
    console.log(`║  🌍  Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
  });
};

startServer();
