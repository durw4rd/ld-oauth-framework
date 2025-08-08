export const DEFAULT_LOCALHOST_PORT = 3000;

// Always use the deployed URL for OAuth redirects since LaunchDarkly doesn't accept localhost
export const FRAMEWORK_URL = process.env.FRAMEWORK_URL || 'https://ld-oauth-framework.vercel.app';

export const getLocalhostPort = () => 
  process.env.LOCALHOST_PORT || DEFAULT_LOCALHOST_PORT;

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

export const validateSessionId = (sessionId: string): boolean => {
  // UUID v4 validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}; 