import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  const { user, repo } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!user || !repo) {
    return res.status(400).json({ error: 'User and repo parameters are required' });
  }

  try {
    const key = `visits:${user}:${repo}`;

    const visits = await redis.incr(key);

    const color = req.query.color || 'blue';

    const timestamp = Date.now();
    const badgeUrl = `https://img.shields.io/badge/Visits-${visits}-${color}?v=${timestamp}`;
    res.redirect(302, badgeUrl);
  } catch (error) {
    console.error('Error fetching visits:', error);
    const badgeUrl = `https://img.shields.io/badge/Visits-Error-red?v=${Date.now()}`;
    res.redirect(302, badgeUrl);
  }
}
