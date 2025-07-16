export default async function handler(req, res) {
  const { user } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!user) {
    return res.status(400).json({ error: 'User parameter is required' });
  }

  try {
    const response = await fetch(`https://api.github.com/users/${user}`, {
      headers: {
        'User-Agent': 'GitHub-Visits-Badge',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const userData = await response.json();

    if (!userData.created_at) {
      throw new Error('User data does not contain created_at field');
    }

    const createdAt = new Date(userData.created_at);
    const now = new Date();
    const years = now.getFullYear() - createdAt.getFullYear();

    const color = req.query.color || 'blue';

    const badgeUrl = `https://img.shields.io/badge/Years%20on%20GitHub-${years}-${color}`;
    res.redirect(302, badgeUrl);

  } catch (error) {
    console.error('Error fetching visits:', error);
    const badgeUrl = `https://img.shields.io/badge/Visits-Error-red`;
    res.redirect(302, badgeUrl);
  }
}
