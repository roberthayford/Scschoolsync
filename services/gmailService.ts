import { Email, CategoryType } from '../types';
import { format, subMonths } from 'date-fns';

// These would typically come from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''; 
const API_KEY = process.env.GOOGLE_API_KEY || ''; 
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

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
  }
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
    const dateQuery = format(startDate, 'yyyy/MM/dd');
    const query = `after:${dateQuery}`; // Gmail API query format

    // 1. List Messages
    const response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20 // Limit for demo purposes, would be higher in prod
    });

    const messages = response.result.messages;
    if (!messages || messages.length === 0) {
      return [];
    }

    // 2. Fetch Details for each message
    // Note: In production, use batch requests for performance
    const detailedEmails: Email[] = [];

    for (const msg of messages) {
      const details = await window.gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full' // 'full' to get headers like Subject, From
      });

      const result = details.result;
      const headers = result.payload.headers;
      
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value;
      const snippet = result.snippet;

      // Basic mapping
      detailedEmails.push({
        id: result.id,
        subject: subject,
        sender: from,
        preview: snippet,
        receivedAt: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
        isProcessed: false,
        // childId, category, summary will be filled by Gemini later
      });
    }

    return detailedEmails;

  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    throw error;
  }
};
