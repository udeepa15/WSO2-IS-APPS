# Debugging Inji Wallet - Step by Step Guide

## Option 1: Android Logcat (No rebuild required)

### Connect device and view logs:
```bash
# Connect your Android device via USB
adb devices

# View all logs (very verbose)
adb logcat

# Filter for errors and OpenID4VP
adb logcat | grep -E "OpenID4VP|QR|Authorization|Presentation|ERROR|Exception"

# Filter for specific tags
adb logcat -s ReactNativeJS:V inji:V

# Clear logs and start fresh
adb logcat -c && adb logcat -v time
```

### Key log tags to watch:
- `ReactNativeJS` - React Native JavaScript logs
- `OpenID4VP` - OpenID4VP protocol logs
- `QRScanner` - QR code scanning logs
- `DIDResolver` - DID resolution logs
- `JWTVerifier` - JWT verification logs
- `PresentationExchange` - Credential presentation logs

## Option 2: React Native Debugger (Most Detailed)

### Enable debugging in Inji app:

1. **Shake your device** or press `Cmd+M` (on emulator) to open React Native debug menu

2. **Enable "Debug"** option

3. **Open Chrome DevTools**:
   ```bash
   # Chrome will open at:
   # chrome://inspect
   ```

4. **Or install React Native Debugger**:
   ```bash
   brew install --cask react-native-debugger
   
   # Open it before running the app
   open -a "React Native Debugger"
   ```

### Add console.logs in Inji source:

Navigate to the Inji source and add logs:

```bash
cd /Users/udeepa/Desktop/VC/inji
```

Edit these files to add detailed logging:

#### File: `machines/bleShare/scan/scanGuards.ts`
```typescript
isOpenIdQr: (_context, event) => {
  const qrContent = event.params.toUpperCase();
  console.log('[DEBUG] QR Content:', event.params);
  const isValid = qrContent.startsWith('OPENID4VP://');
  console.log('[DEBUG] isOpenIdQr:', isValid);
  return isValid;
}
```

#### File: `screens/Scan/OpenID4VPAuthorizationRequest.ts` (or similar)
```typescript
async function fetchAuthorizationRequest(requestUri) {
  console.log('[DEBUG] Fetching request_uri:', requestUri);
  try {
    const response = await fetch(requestUri);
    console.log('[DEBUG] Response status:', response.status);
    const jwt = await response.text();
    console.log('[DEBUG] JWT received:', jwt.substring(0, 100) + '...');
    return jwt;
  } catch (error) {
    console.error('[DEBUG] Fetch error:', error);
    throw error;
  }
}

async function verifyJWT(jwt, didDocument) {
  console.log('[DEBUG] Verifying JWT signature');
  console.log('[DEBUG] DID Document:', JSON.stringify(didDocument, null, 2));
  // ... existing verification code
}
```

#### Rebuild and run:
```bash
cd /Users/udeepa/Desktop/VC/inji

# For Android
npx react-native run-android

# Or for release build with logs enabled
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Option 3: Enable Inji Built-in Debug Mode (If Available)

Some versions of Inji have a debug mode:

1. Open Inji app
2. Go to Settings
3. Look for "Developer Options" or "Debug Mode"
4. Enable detailed logging
5. Check if there's an option to export logs

## Option 4: Inspect Network Traffic

### Using Charles Proxy or mitmproxy:

```bash
# Install mitmproxy
brew install mitmproxy

# Run proxy
mitmproxy -p 8080

# Configure Android to use proxy:
# Settings > WiFi > Long press your network > Modify > Advanced > Proxy
# Set to your computer's IP:8080
```

This will show:
- Request to `request_uri`
- JWT response
- DID document fetch
- VP submission

## Option 5: Check Specific Error Points

Based on the wallet validation requirements, check these common failure points:

### 1. QR Code Parsing
```bash
adb logcat | grep -i "qr\|scan"
```
**Look for**: "Invalid QR code format" or parsing errors

### 2. Request URI Fetch
```bash
adb logcat | grep -i "request_uri\|fetch\|network"
```
**Look for**: Network errors, timeout, 404, SSL errors

### 3. JWT Validation
```bash
adb logcat | grep -i "jwt\|token\|signature"
```
**Look for**: "Invalid JWT typ", "Signature verification failed"

### 4. DID Resolution
```bash
adb logcat | grep -i "did\|resolution"
```
**Look for**: "Cannot resolve DID", "DID document not found"

### 5. Presentation Definition Validation
```bash
adb logcat | grep -i "presentation\|definition\|descriptor"
```
**Look for**: "Invalid presentation_definition", "Missing input_descriptors"

### 6. Credential Matching
```bash
adb logcat | grep -i "credential\|match\|filter"
```
**Look for**: "No matching credentials"

## Quick Start Debugging Commands

### Start with this command to see everything:
```bash
# Clear logs, scan QR, see what happens
adb logcat -c && adb logcat -v time | tee wallet-debug.log
```

Then scan the QR code and watch for:
1. ✅ "QR code scanned" 
2. ✅ "Fetching request_uri: https://..."
3. ✅ "JWT received"
4. ✅ "Resolving DID: did:web:..."
5. ✅ "DID document fetched"
6. ✅ "Verifying JWT signature"
7. ✅ "Signature valid"
8. ✅ "Parsing presentation_definition"
9. ✅ "Matching credentials"
10. ❌ **FAILURE POINT** - Look for ERROR/Exception here

### Save logs to file:
```bash
adb logcat -v time > wallet-debug-$(date +%Y%m%d-%H%M%S).log
```

## Expected Log Flow (Success Case)

```
[QR Scan] Scanned: openid4vp://authorize?client_id=did:web...
[Validation] QR format valid
[Network] Fetching: https://.../vp-request/req_xxx
[Network] Response: 200 OK
[JWT] Received JWT: eyJhbGc...
[JWT] Header: {"alg":"ES256","kid":"did:web...","typ":"oauth-authz-req+jwt"}
[DID] Resolving: did:web:masked-unprofitably-ardith.ngrok-free.dev
[DID] Fetched: https://.../well-known/did.json
[DID] Verification method found
[JWT] Signature valid ✓
[Payload] nonce: abc123...
[Payload] state: xyz789...
[PD] Presentation definition ID: vp_token_presentation_definition
[PD] Input descriptors: 1
[Match] Searching credentials...
[Match] Found 2 matching credentials
[UI] Showing credential selection
```

## Troubleshooting Common Issues

### Issue: "Cannot connect to verifier"
- Check ngrok is running and URL is correct
- Test: `curl https://masked-unprofitably-ardith.ngrok-free.dev/v1/verify/vp-request/req_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7`

### Issue: "Invalid JWT typ"
- Check server logs show `typ: 'oauth-authz-req+jwt'`
- Decode JWT header: `echo "JWT_HEADER" | base64 -d`

### Issue: "Signature verification failed"
- Verify DID document public key matches private key
- Check kid in JWT header matches DID document verification method ID

### Issue: "No matching credentials"
- Check wallet has credentials that match the presentation_definition
- Verify input_descriptor constraints are not too restrictive

## Next Steps

1. Run: `adb logcat -c && adb logcat -v time`
2. Scan QR code with Inji wallet
3. Watch logs in real-time
4. Find the ERROR/Exception line
5. Share the relevant log section for further debugging
