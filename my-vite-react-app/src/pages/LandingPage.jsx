import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";

import { SignInBtn } from "../components/SignInBtn";

export const LandingPage = () => { 

    const { state, getAccessToken, getIDToken, getBasicUserInfo, signIn } = useAuthContext();
    const navigate = useNavigate();

    // Log every state change
    useEffect(() => {
        console.log('[LandingPage] state changed:', JSON.stringify(state));
    }, [state]);

    // On callback, try to complete sign-in and log tokens
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('code')) {
            console.log('[LandingPage] Auth code detected, calling signIn() to complete exchange...');
            signIn()
                .then((response) => {
                    console.log('[LandingPage] signIn() resolved:', response);
                })
                .catch((err) => {
                    console.error('[LandingPage] signIn() rejected:', err);
                });
        }
    }, []);

    // Log tokens when authenticated
    useEffect(() => {
        if (state?.isAuthenticated) {
            console.log('[LandingPage] ✅ Authenticated! Fetching tokens...');
            
            getAccessToken().then(token => {
                console.log('[LandingPage] Access Token:', token?.substring(0, 50) + '...');
            }).catch(e => console.error('[LandingPage] getAccessToken error:', e));

            getIDToken().then(token => {
                console.log('[LandingPage] ID Token:', token?.substring(0, 50) + '...');
            }).catch(e => console.error('[LandingPage] getIDToken error:', e));

            getBasicUserInfo().then(info => {
                console.log('[LandingPage] User Info:', JSON.stringify(info));
            }).catch(e => console.error('[LandingPage] getBasicUserInfo error:', e));

            console.log('[LandingPage] Navigating to /home...');
            navigate("/home", { replace: true });
        }
    }, [state?.isAuthenticated]);

    return (
        <div className="oid4vp-container">
            <div className="oid4vp-card">
                <div className="oid4vp-header">
                    <svg className="oid4vp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h1>OpenID4VP Authentication</h1>
                </div>

                <div className="oid4vp-info">
                    <p className="oid4vp-subtitle">Present Your Verifiable Credentials</p>
                    <p className="oid4vp-description">
                        This demo showcases OpenID for Verifiable Presentations (OpenID4VP) protocol.
                        Authenticate by presenting your verifiable credentials from your digital wallet.
                    </p>
                </div>

                <div className="credential-flow">
                    <div className="flow-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Request Received</h3>
                            <p>Service requests your credentials</p>
                        </div>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Present Credentials</h3>
                            <p>Share your verifiable credentials</p>
                        </div>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Verified Access</h3>
                            <p>Get authenticated access</p>
                        </div>
                    </div>
                </div>

                <div className="button-container">
                    <SignInBtn />
                </div>

                <div className="oid4vp-footer">
                    <p>Powered by WSO2 Identity Server</p>
                </div>
            </div>
        </div>
    );
}
