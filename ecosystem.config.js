module.exports = {
  apps: [{
    name: 'download-app',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 2314,
      HOSTNAME: '127.0.0.1'
    },
    error_file: '/var/log/pm2/download-app-error.log',
    out_file: '/var/log/pm2/download-app-out.log',
    log_file: '/var/log/pm2/download-app-combined.log',
    time: true,
    max_memory_restart: '300M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
