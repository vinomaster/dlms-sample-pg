/**
 * Copyright (c) 2024 Discover Financial Services
 */
const CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
const ISSUER =
    process.env.ISSUER || 'https://{yourOidcDomain}.com/oauth2/default';
const OIDC_TESTING_DISABLEHTTPSCHECK =
    process.env.OIDC_TESTING_DISABLEHTTPSCHECK || false;
const BASENAME = import.meta.env.BASE_URL || '';
// BASENAME includes trailing slash
const REDIRECT_URI = `${window.location.origin}${BASENAME}login/callback`;

const config = {
    oidc: {
        clientId: CLIENT_ID,
        issuer: ISSUER,
        redirectUri: REDIRECT_URI,
        scopes: ['openid', 'profile', 'email'],
        pkce: true,
        disableHttpsCheck: OIDC_TESTING_DISABLEHTTPSCHECK,
    },
    resourceServer: {
        messagesUrl: 'http://localhost:8000/api/messages',
    },
    app: {
        basename: BASENAME,
    },
};

export default config;
