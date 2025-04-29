import app from './vercel-server.js';

export default function handler(req, res) {
  return app(req, res);
}