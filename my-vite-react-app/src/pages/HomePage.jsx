import { useAuthContext } from "@asgardeo/auth-react";

export const HomePage = () => {

    const { signOut, state } = useAuthContext();

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
                    <button className="sign-out-btn" onClick={ () => signOut() }>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
