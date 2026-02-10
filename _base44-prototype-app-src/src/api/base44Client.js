import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "680fc11cf00ff52d15b7d900", 
  requiresAuth: true // Ensure authentication is required for all operations
});
