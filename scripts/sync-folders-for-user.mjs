import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://easemail.app';

async function syncFolders() {
  console.log('📁 Triggering folder sync for all accounts...\n');

  try {
    // This endpoint requires authentication, so we'll call it from the browser console instead
    console.log('Please run this in your browser console while logged in:');
    console.log('\n');
    console.log('```javascript');
    console.log('fetch("/api/folders/sync", {');
    console.log('  method: "POST",');
    console.log('  headers: { "Content-Type": "application/json" }');
    console.log('}).then(r => r.json()).then(console.log);');
    console.log('```');
    console.log('\n');
    console.log('This will sync all folders from Nylas for your email accounts.');
    console.log('After syncing, refresh the inbox page.');
  } catch (error) {
    console.error('Error:', error);
  }
}

syncFolders();
