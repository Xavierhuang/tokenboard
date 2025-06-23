# How to Access Securitize iD APIs

This guide explains how to access and integrate with Securitize iD APIs for your tokenized assets aggregator.

## 1. Prerequisites

### Get API Credentials
1. **Visit Securitize Developer Portal**: [https://developers.securitize.io](https://developers.securitize.io)
2. **Create an Account**: Sign up for a developer account
3. **Create an Application**: Register your application
4. **Get Credentials**: You'll receive:
   - `issuerId` (Client ID)
   - `secret` (Client Secret)
   - Configure redirect URLs

### Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Add your Securitize credentials
SECURITIZE_ISSUER_ID=your_issuer_id_here
SECURITIZE_SECRET=your_secret_here
SECURITIZE_REDIRECT_URL=https://your-domain.com/auth/callback
SECURITIZE_ENVIRONMENT=sandbox
```

## 2. OAuth 2.0 Flow

### Step 1: Redirect User to Securitize
```javascript
// Generate authorization URL
const authUrl = securitizeAPI.getAuthorizationUrl('info', 'optional-state');

// Redirect user
window.location.href = authUrl;
```

### Step 2: User Authenticates on Securitize
- User is redirected to Securitize iD
- User logs in or creates account
- User grants permissions to your application
- Securitize redirects back with authorization code

### Step 3: Exchange Code for Access Token
```javascript
// Handle callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  const response = await fetch('/api/auth/securitize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  const { accessToken, refreshToken } = await response.json();
  // Store tokens securely
}
```

### Step 4: Use Access Token for API Calls
```javascript
// Make authenticated API calls
const response = await fetch('/api/securitize/investor?investorId=123&type=info', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## 3. API Endpoints Overview

### Authentication Endpoints
- `POST /auth/v1/authorize` - Exchange code for access token
- `POST /auth/v1/refresh` - Refresh access token

### Configuration Endpoints
- `GET /config/v1/{issuerId}` - Get application configuration
- `PATCH /config/v1/{issuerId}` - Update application configuration

### Investor Endpoints
- `GET /investors/{id}` - Get basic investor information
- `GET /investors/{id}/details` - Get detailed investor information
- `GET /investors/{id}/verification` - Get KYC/KYB status
- `GET /investors/{id}/documents` - Get uploaded documents
- `GET /investors/{id}/wallets` - Get registered wallets

### Whitelisting Endpoints
- `GET /investors/{id}/whitelisting` - Get whitelisting status
- `POST /investors/{id}/whitelisting` - Request whitelisting

## 4. Implementation Examples

### Basic Authentication Setup
```javascript
import { SecuritizeAPI } from '@/lib/api/securitize';

const securitizeAPI = new SecuritizeAPI(
  process.env.SECURITIZE_ISSUER_ID,
  process.env.SECURITIZE_SECRET,
  process.env.SECURITIZE_REDIRECT_URL,
  'sandbox' // or 'production'
);
```

### React Component for Login
```jsx
import React from 'react';
import { SecuritizeAuth } from '@/components/SecuritizeAuth';

function LoginPage() {
  const handleAuthSuccess = (data) => {
    console.log('Authentication successful:', data);
    // Store tokens and redirect
  };

  const handleAuthError = (error) => {
    console.error('Authentication failed:', error);
  };

  return (
    <SecuritizeAuth 
      onAuthSuccess={handleAuthSuccess}
      onAuthError={handleAuthError}
    />
  );
}
```

### API Route for Handling Callbacks
```javascript
// pages/api/auth/securitize.ts
export default async function handler(req, res) {
  const { code } = req.body;
  
  const securitizeAPI = new SecuritizeAPI(
    process.env.SECURITIZE_ISSUER_ID,
    process.env.SECURITIZE_SECRET,
    process.env.SECURITIZE_REDIRECT_URL,
    process.env.SECURITIZE_ENVIRONMENT
  );

  const authResult = await securitizeAPI.authorize(code);
  
  res.json({ success: true, data: authResult });
}
```

## 5. Error Handling

### Common Error Responses
```javascript
// 401 Unauthorized - Token expired or invalid
if (response.status === 401) {
  // Try to refresh token
  await refreshAccessToken();
}

// 400 Bad Request - Invalid parameters
if (response.status === 400) {
  console.error('Invalid request parameters');
}

// 403 Forbidden - Insufficient permissions
if (response.status === 403) {
  console.error('Insufficient permissions for this action');
}
```

### Token Refresh Logic
```javascript
// Automatic token refresh in API client
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && refreshToken) {
      try {
        await refreshAccessToken();
        // Retry original request
        return client(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 6. Security Best Practices

### Token Storage
```javascript
// Store tokens securely (not in localStorage for production)
const storeTokens = (accessToken, refreshToken) => {
  // Use httpOnly cookies or secure storage
  sessionStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
};

const getTokens = () => ({
  accessToken: sessionStorage.getItem('accessToken'),
  refreshToken: sessionStorage.getItem('refreshToken')
});
```

### Request Headers
```javascript
// Always include required headers
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'clientid': issuerId,
  'Content-Type': 'application/json'
};
```

### State Parameter for Security
```javascript
// Use state parameter to prevent CSRF attacks
const state = generateRandomString();
const authUrl = securitizeAPI.getAuthorizationUrl('info', state);

// Verify state parameter in callback
const returnedState = urlParams.get('state');
if (returnedState !== state) {
  throw new Error('State parameter mismatch');
}
```

## 7. Testing

### Sandbox Environment
```javascript
// Use sandbox for testing
const securitizeAPI = new SecuritizeAPI(
  issuerId,
  secret,
  redirectUrl,
  'sandbox' // Use sandbox environment
);
```

### Test Credentials
- Use test investor accounts provided by Securitize
- Test all API endpoints in sandbox first
- Verify error handling with invalid tokens

## 8. Production Deployment

### Environment Variables
```bash
# Production environment
SECURITIZE_ENVIRONMENT=production
SECURITIZE_REDIRECT_URL=https://your-production-domain.com/auth/callback
```

### SSL/TLS
- Always use HTTPS in production
- Configure proper SSL certificates
- Use secure cookie settings

### Rate Limiting
- Implement proper rate limiting
- Cache responses when appropriate
- Handle 429 (Too Many Requests) errors

## 9. Troubleshooting

### Common Issues
1. **Invalid redirect URL**: Ensure URL is whitelisted in Securitize
2. **Token expiration**: Implement proper refresh logic
3. **CORS issues**: Configure proper CORS headers
4. **State parameter mismatch**: Verify state parameter handling

### Debug Mode
```javascript
// Enable debug logging
const securitizeAPI = new SecuritizeAPI(
  issuerId,
  secret,
  redirectUrl,
  environment
);

// Check console for API request/response logs
```

## 10. Next Steps

1. **Set up your Securitize developer account**
2. **Configure your application in Securitize portal**
3. **Test the OAuth flow in sandbox**
4. **Implement investor management features**
5. **Add wallet registration and whitelisting**
6. **Deploy to production**

For detailed API documentation, visit the [Securitize iD Swagger documentation](https://docs.securitize.io). 