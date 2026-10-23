const localUrl = (port) => `http://localhost:${port}`;

export const services = {
  auth: process.env.AUTH_SERVICE_URL || localUrl(8001),
  organization:
    process.env.ORGANIZATION_SERVICE_URL || localUrl(8002),
  email: process.env.EMAIL_SERVICE_URL || localUrl(8003),
  ai: process.env.AI_SERVICE_URL || localUrl(8004),
  task: process.env.TASK_SERVICE_URL || localUrl(8005),
  reply: process.env.REPLY_SERVICE_URL || localUrl(8006),
  notification:
    process.env.NOTIFICATION_SERVICE_URL || localUrl(8007),
  analytics:
    process.env.ANALYTICS_SERVICE_URL || localUrl(8008)
};