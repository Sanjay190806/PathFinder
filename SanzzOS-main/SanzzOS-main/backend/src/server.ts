import app from './app.js';
import { env } from './config/env.js';

const port = env.PORT;
console.log(`Groq configured: ${Boolean(env.GROQ_API_KEY?.trim())}`);

const server = app.listen(port, () => {
  console.log(`Server started in ${env.NODE_ENV} mode on port ${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n========================================`);
    console.error(`ERROR: Port ${port} is already in use.`);
    console.error(`========================================`);
    console.error(`Another backend instance may already be running.`);
    console.error(`\nTo find the process using port ${port}:`);
    console.error(`  netstat -ano | findstr :${port}`);
    console.error(`\nTo kill the process (replace <PID> with actual PID):`);
    console.error(`  taskkill /PID <PID> /F`);
    console.error(`\nOr use the Stop-Sanzz-OS.bat script to stop all instances.`);
    console.error(`========================================\n`);
  } else if (error.code === 'EACCES') {
    console.error(`\nERROR: Permission denied. Port ${port} requires elevated privileges.\n`);
  } else {
    console.error(`\nERROR: Failed to start server: ${error.message}\n`);
  }
  process.exit(1);
});
