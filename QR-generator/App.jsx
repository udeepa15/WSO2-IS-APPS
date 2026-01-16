import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const defaultValue =
  'openid4vp://authorize?client_id=did%3Aweb%3Amasked-unprofitably-ardith.ngrok-free.dev&request_uri=https%3A%2F%2Fmasked-unprofitably-ardith.ngrok-free.dev%2Fv1%2Fverify%2Fvp-request%2Freq_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7';

function App() {
  const [input, setInput] = useState(defaultValue);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>OPENID4VP QR Code Generator</h2>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        cols={60}
        style={{ marginBottom: 20 }}
      />
      <QRCode value={input} size={256} />
    </div>
  );
}

export default App;
