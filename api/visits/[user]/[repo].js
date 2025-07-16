import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { user, repo } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!user || !repo) {
    return res.status(400).json({ error: 'User and repo parameters are required' });
  }

  try {
    const key = `visits:${user}:${repo}`;

    const visits = await kv.incr(key);

    const color = req.query.color || 'blue';

    const badgeUrl = `https://img.shields.io/badge/Visits-${visits}-${color}`;
    res.redirect(302, badgeUrl);
  } catch (error) {
    console.error('Error fetching visits:', error);
    const badgeUrl = `https://img.shields.io/badge/Visits-Error-red`;
    res.redirect(302, badgeUrl);
  }
}
