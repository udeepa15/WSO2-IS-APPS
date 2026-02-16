import { useAuthContext } from "@asgardeo/auth-react";
import { useState } from "react";

export const HomePage = () => {

    const { signOut, state, getIDToken, getAccessToken } = useAuthContext();
    const [showTokens, setShowTokens] = useState(false);
    const [idToken, setIdToken] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [decodedIdToken, setDecodedIdToken] = useState(null);
    const [decodedAccessToken, setDecodedAccessToken] = useState(null);

    // Function to decode JWT token
    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    // Function to fetch and display tokens
    const handleShowTokens = async () => {
        try {
            const idTokenValue = await getIDToken();
            const accessTokenValue = await getAccessToken();
            
            setIdToken(idTokenValue);
            setAccessToken(accessTokenValue);
            setDecodedIdToken(decodeJWT(idTokenValue));
            setDecodedAccessToken(decodeJWT(accessTokenValue));
            setShowTokens(true);
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    };

    return (
        <div className="home-container">
            <div className="home-card">
                <div className="success-header">
                    <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1>Credential Verified Successfully!</h1>
                </div>

                <div className="verification-info">
                    <p className="verification-subtitle">Your credentials have been verified</p>
                    <p className="verification-description">
                        You have successfully authenticated using OpenID4VP protocol.
                        Your verifiable credentials were presented and validated.
                    </p>
                </div>

                <div className="credential-details">
                    <h3>Authentication Details</h3>
                    <div className="detail-item">
                        <span className="detail-label">Protocol:</span>
                        <span className="detail-value">OpenID for Verifiable Presentations (OpenID4VP)</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value status-authenticated">✓ Authenticated</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Provider:</span>
                        <span className="detail-value">WSO2 Identity Server</span>
                    </div>
                </div>

                <div className="home-actions">
                    <button className="show-tokens-btn" onClick={handleShowTokens}>
                        {showTokens ? "Refresh Tokens" : "Show Tokens"}
                    </button>
                    <button className="sign-out-btn" onClick={ () => signOut() }>
                        Sign Out
                    </button>
                </div>

                {showTokens && (
                    <div className="tokens-section">
                        {/* ID Token Section */}
                        <div className="token-container">
                            <h3 className="token-title">ID Token</h3>
                            <div className="token-box">
                                <pre className="token-text">{idToken}</pre>
                            </div>
                            {decodedIdToken && (
                                <>
                                    <h4 className="decoded-title">Decoded ID Token</h4>
                                    <div className="decoded-box">
                                        <pre className="decoded-text">
                                            {JSON.stringify(decodedIdToken, null, 2)}
                                        </pre>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Access Token Section */}
                        <div className="token-container">
                            <h3 className="token-title">Access Token</h3>
                            <div className="token-box">
                                <pre className="token-text">{accessToken}</pre>
                            </div>
                            {decodedAccessToken && (
                                <>
                                    <h4 className="decoded-title">Decoded Access Token</h4>
                                    <div className="decoded-box">
                                        <pre className="decoded-text">
                                            {JSON.stringify(decodedAccessToken, null, 2)}
                                        </pre>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
