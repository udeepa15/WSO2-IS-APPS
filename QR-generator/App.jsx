import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Verification Default
const verificationDefault =
  'openid4vp://authorize?client_id=did%3Aweb%3Amasked-unprofitably-ardith.ngrok-free.dev&request_uri=https%3A%2F%2Fmasked-unprofitably-ardith.ngrok-free.dev%2Fv1%2Fverify%2Fvp-request%2Freq_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7';

function App() {
  const [activeTab, setActiveTab] = useState('issuance'); // Default to Issuance as requested

  // Verification State
  const [verificationInput, setVerificationInput] = useState(verificationDefault);

  // Issuance State
  const [selectedCredential, setSelectedCredential] = useState('IdentityCredential');
  const [offerQr, setOfferQr] = useState('');
  const [offerLink, setOfferLink] = useState('');

  const generateOffer = async () => {
    try {
      // Call local backend to generate offer
      // Assuming frontend runs on same host/port logic or forwarded
      // Since it's vite, usually proxies or CORS. 
      // server.js is CORS enabled.
      // Use the ngrok URL to ensure wallet can reach it?
      // Or localhost if running locally?
      // The server is at http://localhost:4000.

      const response = await fetch('http://localhost:4000/v1/issuance/create-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential_configuration_ids: [selectedCredential]
        })
      });

      const data = await response.json();
      setOfferQr(data.qr_code);
      setOfferLink(data.offer_uri);
    } catch (e) {
      alert('Failed to generate offer: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>WSO2 OpenID4VC Tester</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('issuance')}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            background: activeTab === 'issuance' ? '#007bff' : '#eee',
            color: activeTab === 'issuance' ? 'white' : 'black',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          Issuance (VCI)
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'verification' ? '#007bff' : '#eee',
            color: activeTab === 'verification' ? 'white' : 'black',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          Verification (VP)
        </button>
      </div>

      {activeTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Verification Request</h2>
          <textarea
            value={verificationInput}
            onChange={e => setVerificationInput(e.target.value)}
            rows={4}
            cols={60}
            style={{ marginBottom: 20 }}
          />
          <QRCodeCanvas value={verificationInput} size={256} />
        </div>
      )}

      {activeTab === 'issuance' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Credential Issuance</h2>
          <div style={{ marginBottom: 20 }}>
            <label style={{ marginRight: 10 }}>Select Credential:</label>
            <select
              value={selectedCredential}
              onChange={e => setSelectedCredential(e.target.value)}
              style={{ padding: 5 }}
            >
              <option value="IdentityCredential">IdentityCredential (JWT)</option>
              <option value="IdentityCredential_LDP">IdentityCredential (LDP)</option>
              <option value="IdentityCredential_SD">IdentityCredential (SD-JWT)</option>
              <option value="DriverLicenseCredential">DriverLicenseCredential (JWT)</option>
            </select>
            <button
              onClick={generateOffer}
              style={{
                marginLeft: 10,
                padding: '5px 15px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
              }}
            >
              Generate Offer
            </button>
          </div>

          {offerQr && (
            <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 10 }}>
              <QRCodeCanvas value={offerQr} size={256} />
              <p style={{ marginTop: 15, width: 300, wordBreak: 'break-all', fontSize: 12 }}>
                {offerQr}
              </p>
              <a href={offerQr} style={{ display: 'block', marginTop: 10, color: '#007bff' }}>
                Open Deep Link
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
