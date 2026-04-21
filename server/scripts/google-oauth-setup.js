// One-time script: generates a Google OAuth refresh token
// for Calendar + Gmail access.
//
// Setup:
//   1. Go to https://console.cloud.google.com/
//   2. Create a new project (or reuse)
//   3. Enable APIs: Google Calendar API, Gmail API
//   4. OAuth consent screen: External, add your email as test user
//   5. Credentials -> Create OAuth client ID -> Desktop app
//   6. Copy Client ID + Secret into server/.env:
//        GOOGLE_CLIENT_ID=...
//        GOOGLE_CLIENT_SECRET=...
//   7. Run this script: node scripts/google-oauth-setup.js
//   8. Open the URL it prints, authorize, paste the code back
//   9. Copy the printed refresh token into .env as GOOGLE_REFRESH_TOKEN
//
// After that, never run this again unless you revoke access.

import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
];

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'; // Desktop/CLI flow

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env\n');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);

const url = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('\n1. Open this URL in your browser:\n');
console.log(url);
console.log('\n2. Authorize access.');
console.log('3. Copy the code Google gives you back here.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste code: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    if (!tokens.refresh_token) {
      console.error('\nNo refresh_token returned. Revoke access at https://myaccount.google.com/permissions and try again.\n');
      process.exit(1);
    }
    console.log('\nSuccess. Add this to server/.env:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (e) {
    console.error('\nFailed to exchange code:', e.message);
    process.exit(1);
  }
});
