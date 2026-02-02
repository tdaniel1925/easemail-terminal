import Nylas from 'nylas';

const nylasConfig = {
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
};

export const nylas = new Nylas(nylasConfig);

export const nylasClientId = process.env.NYLAS_CLIENT_ID!;

// OAuth configuration
export const nylasOAuthConfig = {
  clientId: nylasClientId,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`,
};
