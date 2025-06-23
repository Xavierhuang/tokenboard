# Quick Start: Accessing Securitize iD APIs

## 🚀 Get Started in 5 Minutes

### 1. Get Your Securitize Credentials

1. **Visit**: [https://developers.securitize.io](https://developers.securitize.io)
2. **Sign Up**: Create a developer account
3. **Create App**: Register your application
4. **Get Credentials**: You'll receive:
   - `issuerId` (Client ID)
   - `secret` (Client Secret)

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local and add your credentials
SECURITIZE_ISSUER_ID=your_issuer_id_here
SECURITIZE_SECRET=your_secret_here
SECURITIZE_REDIRECT_URL=http://localhost:3000/test-securitize
SECURITIZE_ENVIRONMENT=sandbox
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Test the Integration

1. **Open**: [http://localhost:3000/test-securitize](http://localhost:3000/test-securitize)
2. **Click**: "Login with Securitize"
3. **Complete**: OAuth authentication on Securitize
4. **Test**: API endpoints and view investor dashboard

## 🔧 How It Works

### OAuth 2.0 Flow
```
1. User clicks "Login with Securitize"
2. Redirected to Securitize iD for authentication
3. User grants permissions to your app
4. Securitize redirects back with authorization code
5. Your app exchanges code for access token
6. Use access token for API calls
```

### API Endpoints Available
- **Authentication**: `/api/auth/securitize`
- **Configuration**: `/api/securitize/config`
- **Investor Info**: `/api/securitize/investor`
- **Whitelisting**: `/api/securitize/whitelisting`

### Smart Contracts to Integrate
- **ERC-1400**: Security token standard
- **DS Protocol**: Securitize's digital securities protocol
- **ERC-1404**: Restricted token standard

## 📚 Next Steps

1. **Test OAuth Flow**: Use the test page to verify authentication
2. **Explore APIs**: Test different investor endpoints
3. **Add Features**: Implement wallet registration and whitelisting
4. **Integrate Other Platforms**: Add Polymath, tZERO, etc.
5. **Deploy**: Move to production environment

## 🔗 Useful Links

- **Test Page**: [http://localhost:3000/test-securitize](http://localhost:3000/test-securitize)
- **Main Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Documentation**: [docs/SECURITIZE_ACCESS_GUIDE.md](docs/SECURITIZE_ACCESS_GUIDE.md)
- **API Reference**: [docs/APIS_AND_SMART_CONTRACTS.md](docs/APIS_AND_SMART_CONTRACTS.md)

## 🛠️ Troubleshooting

### Common Issues
1. **Invalid redirect URL**: Ensure URL matches your Securitize app configuration
2. **Authentication fails**: Check your issuerId and secret
3. **API errors**: Verify you're using the correct environment (sandbox/production)

### Debug Mode
- Check browser console for API request/response logs
- Use the "Test All Endpoints" button to verify API access
- Review the Investor Dashboard for data display

## 🎯 What You Can Build

With this integration, you can build:
- **Tokenized Assets Aggregator**: View assets from multiple platforms
- **Investor Management**: KYC/KYB/AML compliance tracking
- **Portfolio Management**: Track investments across platforms
- **Trading Interface**: Execute trades through integrated platforms
- **Compliance Dashboard**: Monitor regulatory requirements

The Securitize Connect API provides the foundation for a compliant, professional tokenized assets platform! 