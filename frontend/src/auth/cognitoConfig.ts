export const cognitoAuthConfig = {
  authority: "https://recreahub-auth.us-east-1.amazoncognito.com",
  client_id: "bf3lu8k2nf72luja03i7jig2a",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid email profile",
  post_logout_redirect_uri: window.location.origin,
};
