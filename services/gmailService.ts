
import { Email } from '../types';
import { format, subMonths } from 'date-fns';

// Mutable variables to allow runtime configuration
let CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
let API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const TOKEN_STORAGE_KEY = 'schoolsync_gmail_token';
const CREDS_STORAGE_KEY = 'schoolsync_google_creds';

// Attempt to load credentials from localStorage on module load
try {
  const storedCreds = localStorage.getItem(CREDS_STORAGE_KEY);
  if (storedCreds) {
    const parsed = JSON.parse(storedCreds);
    if (parsed.clientId) CLIENT_ID = parsed.clientId;
    if (parsed.apiKey) API_KEY = parsed.apiKey;
  }
} catch (e) {
  console.error("Failed to load stored credentials", e);
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Helper to update credentials from UI
export const updateGoogleCredentials = (clientId: string, apiKey: string) => {
  CLIENT_ID = clientId;
  API_KEY = apiKey;
  localStorage.setItem(CREDS_STORAGE_KEY, JSON.stringify({ clientId, apiKey }));
};

export const hasValidCredentials = () => {
  return !!CLIENT_ID && !!API_KEY;
};

// Helper to decode Gmail body (URL-safe base64)
const decodeEmailBody = (data: string) => {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Error decoding email body", e);
    return "";
  }
};

const extractEmailBody = (payload: any): string => {
  if (!payload) return "";

  if (payload.body && payload.body.data) {
    return decodeEmailBody(payload.body.data);
  }

  if (payload.parts) {
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart && plainPart.body && plainPart.body.data) {
      return decodeEmailBody(plainPart.body.data);
    }

    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      const html = decodeEmailBody(htmlPart.body.data);
      return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    }

    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractEmailBody(part);
        if (nested) return nested;
      }
    }
  }

  return "";
};

export const initializeGmailApi = async (): Promise<boolean> => {
  if (!CLIENT_ID || !API_KEY) {
    console.warn("Google Client ID or API Key not set.");
    return false;
  }

  // Reset state on re-initialization attempt
  gapiInited = false;
  gisInited = false;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("Google Identity Services script timed out.");
      resolve(false);
    }, 5000);

    const checkLibs = setInterval(() => {
      if (window.gapi && window.google) {
        clearInterval(checkLibs);
        clearTimeout(timeout);

        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });

            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            if (storedToken) {
              try {
                const token = JSON.parse(storedToken);
                window.gapi.client.setToken(token);
              } catch (e) {
                console.error("Error restoring token", e);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
              }
            }

            gapiInited = true;
            maybeEnableButtons();
          } catch (err) {
            console.error("GAPI Client Init Error", err);
            resolve(false);
          }
        });

        if (window.google.accounts && window.google.accounts.oauth2) {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
          });
          gisInited = true;
          maybeEnableButtons();
        } else {
          console.error("Google Accounts OAuth2 not found");
        }
      }
    }, 100);

    const maybeEnableButtons = () => {
      if (gapiInited && gisInited) {
        resolve(true);
      }
    };
  });
};

export const handleAuthClick = async (emailHint?: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Token client not initialized");

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }

      const token = window.gapi.client.getToken();
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
      } else if (resp.access_token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(resp));
        window.gapi.client.setToken(resp);
      }

      resolve(true);
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent', login_hint: emailHint });
    } else {
      tokenClient.requestAccessToken({ prompt: '', login_hint: emailHint });
    }
  });
};

export const handleSignoutClick = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const isUserSignedIn = () => {
  return window.gapi && window.gapi.client && window.gapi.client.getToken() !== null;
};

export const getGmailUserProfile = async () => {
  try {
    const response = await window.gapi.client.gmail.users.getProfile({
      userId: 'me'
    });
    return response.result;
  } catch (err) {
    console.error("Error fetching profile", err);
    throw err;
  }
};

const processMessages = async (messages: any[]): Promise<Email[]> => {
  if (!messages || messages.length === 0) return [];

  const detailedEmails: Email[] = [];

  for (const msg of messages) {
    try {
      const details = await window.gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });

      const result = details.result;
      const headers = result.payload.headers;

      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value;
      const snippet = result.snippet;

      const bodyContent = extractEmailBody(result.payload);

      detailedEmails.push({
        id: result.id,
        subject: subject,
        sender: from,
        preview: snippet,
        body: bodyContent || snippet,
        receivedAt: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
        isProcessed: false,
      });
    } catch (innerErr) {
      console.warn(`Failed to fetch email ${msg.id}`, innerErr);
    }
  }
  return detailedEmails;
};

export const fetchRecentEmails = async (monthsBack: number = 2): Promise<Email[]> => {
  try {
    const startDate = subMonths(new Date(), monthsBack);
    const dateQuery = format(startDate, 'yyyy/MM/dd');
    const query = `after:${dateQuery}`;

    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50
    });

    return processMessages(response.result.messages);

  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    throw error;
  }
};

export const searchEmails = async (terms: string[], monthsBack: number): Promise<Email[]> => {
  try {
    if (terms.length === 0) return [];

    const termQuery = terms.map(t => `from:${t}`).join(' OR ');
    const startDate = subMonths(new Date(), monthsBack);
    const dateQuery = format(startDate, 'yyyy/MM/dd');
    const fullQuery = `(${termQuery}) after:${dateQuery}`;

    console.log("Executing Gmail Query:", fullQuery);

    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: fullQuery,
      maxResults: 50
    });

    return processMessages(response.result.messages);

  } catch (error) {
    console.error("Error searching emails:", error);
    throw error;
  }
};
