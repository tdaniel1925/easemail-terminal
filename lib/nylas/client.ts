import Nylas from 'nylas';

let nylasInstance: Nylas | null = null;

function getNylasClient(): Nylas {
  if (!nylasInstance) {
    if (!process.env.NYLAS_API_KEY) {
      throw new Error('NYLAS_API_KEY environment variable is not set');
    }
    // P4-API-004: Add timeout configuration to Nylas client
    const nylasConfig = {
      apiKey: process.env.NYLAS_API_KEY,
      apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
      timeout: 30000, // 30 seconds timeout for Nylas API calls
    };
    nylasInstance = new Nylas(nylasConfig);
  }
  return nylasInstance;
}

export const nylas = getNylasClient;

export function getNylasClientId(): string {
  if (!process.env.NYLAS_CLIENT_ID) {
    throw new Error('NYLAS_CLIENT_ID environment variable is not set');
  }
  return process.env.NYLAS_CLIENT_ID;
}

// OAuth configuration
export function getNylasOAuthConfig() {
  return {
    clientId: getNylasClientId(),
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`,
  };
}
