import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';

// P4-API-012: Validate environment variables before SDK initialization
if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
  console.warn('Microsoft Azure credentials not fully configured. Teams integration will be unavailable.');
}

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'placeholder',
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'placeholder',
  },
};

// Token scopes for MS Graph
export const GRAPH_SCOPES = [
  'https://graph.microsoft.com/Calendars.ReadWrite',
  'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
  'https://graph.microsoft.com/User.Read',
  'offline_access',
];

/**
 * Get MS Graph Client with user access token
 * P4-API-003: Add timeout and error handling to Microsoft Graph client
 */
export async function getGraphClient(accessToken: string) {
  try {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
      // Configure middleware with timeout
      middleware: {
        timeout: 30000, // 30 seconds timeout for Graph API calls
      } as any,
    });
  } catch (error) {
    console.error('Failed to initialize Microsoft Graph client:', error);
    throw new Error('Microsoft Graph client initialization failed');
  }
}

/**
 * Get MSAL Confidential Client for OAuth flow
 * P4-API-013: Add error handling for MSAL client initialization
 */
export function getMSALClient() {
  try {
    return new ConfidentialClientApplication(msalConfig);
  } catch (error) {
    console.error('Failed to initialize MSAL client:', error);
    throw new Error('Microsoft authentication is not properly configured');
  }
}

/**
 * Get OAuth authorization URL
 */
export async function getAuthUrl(redirectUri: string, state: string) {
  const client = getMSALClient();

  return client.getAuthCodeUrl({
    scopes: GRAPH_SCOPES,
    redirectUri,
    state,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokenFromCode(code: string, redirectUri: string) {
  const client = getMSALClient();

  const response = await client.acquireTokenByCode({
    code,
    scopes: GRAPH_SCOPES,
    redirectUri,
  });

  console.log('MSAL response keys:', Object.keys(response));
  console.log('MSAL response details:', {
    hasAccessToken: !!response.accessToken,
    hasExpiresOn: !!response.expiresOn,
    hasAccount: !!response.account,
    allKeys: Object.keys(response),
  });

  // Try to get refresh token from various possible locations
  const refreshToken = (response as any).refreshToken ||
                       (response as any).refresh_token ||
                       (response.account as any)?.refreshToken;

  console.log('Refresh token found:', !!refreshToken);

  return {
    accessToken: response.accessToken,
    refreshToken: refreshToken || 'placeholder', // Use placeholder if not available
    expiresOn: response.expiresOn,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  const client = getMSALClient();

  const response = await client.acquireTokenByRefreshToken({
    refreshToken,
    scopes: GRAPH_SCOPES,
  });

  if (!response) {
    throw new Error('Failed to refresh token');
  }

  return {
    accessToken: response.accessToken,
    refreshToken: (response as any).refreshToken || refreshToken, // Keep existing refresh token if not returned
    expiresOn: response.expiresOn,
  };
}

/**
 * Fetch upcoming Teams meetings from MS Graph
 * P4-API-014: Add timeout and error handling for Graph API calls
 */
export async function getUpcomingMeetings(accessToken: string, daysAhead: number = 7) {
  try {
    const client = await getGraphClient(accessToken);

    const startDateTime = new Date().toISOString();
    const endDateTime = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    // Get calendar events with online meeting info
    const response = await client
      .api('/me/calendar/calendarView')
      .query({
        startDateTime,
        endDateTime,
        $select: 'subject,start,end,isOnlineMeeting,onlineMeeting,organizer,attendees,location',
        $orderby: 'start/dateTime',
        $top: 50,
      })
      .get();

    // Filter only Teams meetings
    const teamsMeetings = response.value.filter((event: any) =>
      event.isOnlineMeeting &&
      event.onlineMeeting?.joinUrl?.includes('teams.microsoft.com')
    );

    return teamsMeetings;
  } catch (error) {
    console.error('Failed to fetch Teams meetings:', error);
    throw new Error('Failed to fetch Teams meetings from Microsoft Graph');
  }
}

/**
 * Create a new Teams meeting
 * P4-API-015: Add error handling and validation for Teams meeting creation
 */
export async function createTeamsMeeting(
  accessToken: string,
  meetingDetails: {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    timezone?: string; // User's IANA timezone (e.g., "America/Chicago")
    attendees?: string[];
    content?: string;
  }
) {
  try {
    const client = await getGraphClient(accessToken);

    // Use provided timezone or fallback to UTC
    const timeZone = meetingDetails.timezone || 'UTC';

    const event = {
      subject: meetingDetails.subject,
      start: {
        dateTime: meetingDetails.startDateTime, // "2026-02-18T15:00:00" in user's timezone
        timeZone: timeZone, // User's actual timezone (e.g., "America/Chicago")
      },
      end: {
        dateTime: meetingDetails.endDateTime, // "2026-02-18T16:00:00" in user's timezone
        timeZone: timeZone, // Same timezone as start
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
      attendees: meetingDetails.attendees?.map(email => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })) || [],
      body: {
        contentType: 'HTML',
        content: meetingDetails.content || '',
      },
    };

    const response = await client
      .api('/me/calendar/events')
      .post(event);

    return response;
  } catch (error) {
    console.error('Failed to create Teams meeting:', error);
    throw new Error('Failed to create Teams meeting via Microsoft Graph');
  }
}

/**
 * Get user's MS Graph profile
 */
export async function getUserProfile(accessToken: string) {
  const client = await getGraphClient(accessToken);

  const user = await client
    .api('/me')
    .select('displayName,mail,userPrincipalName')
    .get();

  return user;
}
