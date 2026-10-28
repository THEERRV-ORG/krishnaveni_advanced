// The browser's Firebase settings, read from the server's environment on every page request.
// Hosts such as Azure pass settings only while the app runs, not while it builds, so the
// browser cannot rely on values baked in by Vite. These are public identifiers, not secrets.
export function renderClientConfig(): string {
  const firebase = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };
  if (!firebase.apiKey || !firebase.projectId) return '';
  // JSON inside <script> must not be able to close the tag.
  const json = JSON.stringify({ firebase }).replace(/</g, '\\u003c');
  return `<script>window.__APP_CONFIG__=${json}</script>`;
}
