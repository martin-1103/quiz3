module.exports = {
  apps: [
    {
      name: 'quiz-platform-backend',
      script: './backend/dist/index.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './backend/logs/err.log',
      out_file: './backend/logs/out.log',
      log_file: './backend/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max_old_space_size=1024',
    },
    {
      name: 'quiz-platform-frontend',
      script: 'npm run start',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './frontend/logs/err.log',
      out_file: './frontend/logs/out.log',
      log_file: './frontend/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
    }
  ],
};
