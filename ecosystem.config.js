module.exports = {
  apps: [
    {
      name: 'base-nextjs',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/home/arthur/meus-projetos/base-nextjs',
      out_file: '/home/arthur/meus-projetos/base-nextjs/logs/pm2-out.log',
      error_file: '/home/arthur/meus-projetos/base-nextjs/logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
