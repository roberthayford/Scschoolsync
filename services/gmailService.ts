
import { Email } from '../types';
import { format, subMonths } from 'date-fns';

// These would typically come from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''; 
const API_KEY = process.env.GOOGLE_API_KEY || ''; 
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const STORAGE_KEY = 'schoolsync_gmail_token';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Interface for the window object to include google/gapi types
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Helper to decode Gmail body (URL-safe base64)
const decodeEmailBody = (data: string) => {
  try {
    // Gmail uses URL-safe base64
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
  
  // 1. Plain text directly in payload body
  if (payload.body && payload.body.data) {
    return decodeEmailBody(payload.body.data);
  }

  // 2. Multipart payload
  if (payload.parts) {
    // Priority 1: text/plain
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart && plainPart.body && plainPart.body.data) {
      return decodeEmailBody(plainPart.body.data);
    }

    // Priority 2: text/html (strip tags for basic analysis)
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      const html = decodeEmailBody(htmlPart.body.data);
      // Simple tag strip for cleaner text analysis
      return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Priority 3: Recursive search (e.g. multipart/alternative inside mixed)
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
  if (!CLIENT_ID) {
    console.warn("Google Client ID not set. Gmail integration will not work.");
    return false;
  }

  return new Promise((resolve) => {
    const checkLibs = setInterval(() => {
      if (window.gapi && window.google) {
        clearInterval(checkLibs);
        
        window.gapi.load('client', async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          
          // Restore token from local storage if available
          const storedToken = localStorage.getItem(STORAGE_KEY);
          if (storedToken) {
            try {
              const token = JSON.parse(storedToken);
              window.gapi.client.setToken(token);
            } catch (e) {
              console.error("Error restoring token", e);
              localStorage.removeItem(STORAGE_KEY);
            }
          }

          gapiInited = true;
          maybeEnableButtons();
        });

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }
    }, 100);

    const maybeEnableButtons = () => {
      if (gapiInited && gisInited) {
        resolve(true);
      }
    };
  });
};

export const handleAuthClick = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Token client not initialized");

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      
      // Securely store the token
      const token = window.gapi.client.getToken();
      if (token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      } else if (resp.access_token) {
        // Fallback if gapi client hasn't updated yet, use response directly
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resp));
        window.gapi.client.setToken(resp);
      }

      resolve(true);
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const handleSignoutClick = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
    localStorage.removeItem(STORAGE_KEY);
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

export const fetchRecentEmails = async (monthsBack: number = 2): Promise<Email[]> => {
  try {
    // Calculate date for "past 2 months"
    const startDate = subMonths(new Date(), monthsBack);
    // Gmail requires YYYY/MM/DD format
    const dateQuery = format(startDate, 'yyyy/MM/dd');
    const query = `after:${dateQuery}`; // Gmail API query format

    // 1. List Messages
    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50 // Fetch up to 50 emails to prevent system overload
    });

    const messages = response.result.messages;
    if (!messages || messages.length === 0) {
      return [];
    }

    // 2. Fetch Details for each message
    // Note: In production, use batch requests for performance
    const detailedEmails: Email[] = [];

    for (const msg of messages) {
      try {
        const details = await window.gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full' // 'full' to get headers like Subject, From, and body payload
        });

        const result = details.result;
        const headers = result.payload.headers;
        
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const dateHeader = headers.find((h: any) => h.name === 'Date')?.value;
        const snippet = result.snippet;
        
        // Extract body
        const bodyContent = extractEmailBody(result.payload);

        // Basic mapping
        detailedEmails.push({
          id: result.id,
          subject: subject,
          sender: from,
          preview: snippet,
          body: bodyContent || snippet, // Fallback to snippet if body extraction fails
          receivedAt: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
          isProcessed: false,
          // childId, category, summary will be filled by Gemini later
        });
      } catch (innerErr) {
        console.warn(`Failed to fetch email ${msg.id}`, innerErr);
      }
    }

    return detailedEmails;

  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    throw error;
  }
};
