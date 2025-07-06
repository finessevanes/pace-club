const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
// const ACCESS_TOKEN = 'd3e6636f68bae5890e29f339fc0fc19ce09fbdbf';
require('dotenv').config();

// Dummy in-memory token store for demo purposes
// const userTokens = {
//   '82406039': 'd3e6636f68bae5890e29f339fc0fc19ce09fbdbf'
// };

app.get('/api/user-stats/:userId', async (req, res) => {
  const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  let page = 1;
  let longestRun = null;

  try {
    while (true) {
      const resp = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer d3e6636f68bae5890e29f339fc0fc19ce09fbdbf` },
        params: { after: oneYearAgo, per_page: 200, page }
      });
      if (!resp.data.length) break;

      const runs = resp.data.filter(a => a.type === 'Run');
      for (const run of runs) {
        if (!longestRun || run.distance > longestRun.distance) {
          longestRun = run;
        }
      }
      if (resp.data.length < 200) break;
      page++;
    }

    if (longestRun) {
      res.json({
        longestRun: Math.round(longestRun.distance / 1000 * 100) / 100, // in km
        date: longestRun.start_date_local
      });
    } else {
      res.json({ message: 'No runs found in the last year.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/strava/auth', (req, res) => {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:3001/api/strava/callback');
  const scope = 'activity:read_all';
  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
  res.redirect(stravaAuthUrl);
});

app.get('/api/strava/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3001/api/strava/callback';

  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;
    res.json({
      access_token,
      refresh_token,
      expires_at,
      athlete
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Pace Club Backend is running! Use /api/user-stats/:userId to get running stats.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});