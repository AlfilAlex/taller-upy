const domain = "https://us-east-1tur77qjjm.auth.us-east-1.amazoncognito.com"; //
const clientId = "bf3lu8k2nf72luja03i7jig2a"; //
const baseParams = `client_id=bf3lu8k2nf72luja03i7jig2a&response_type=code&scope=email+openid+phone&redirect_uri=http%3A%2F%2Flocalhost%3A5173`;



// Hosted UI endpoints
export const loginUrl = `${domain}/login?${baseParams}`; // pantalla login (incluye link a signup)
export const signupUrl = `${domain}/signup?${baseParams}`; // abre formulario de registro directo
export const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
  window.location.origin
)}`;


export const cognitoAuthConfig = {
  authority: "https://us-east-1tur77qjjm.auth.us-east-1.amazoncognito.com",
  client_id: "bf3lu8k2nf72luja03i7jig2a",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid email profile",
  post_logout_redirect_uri: window.location.origin,
};
