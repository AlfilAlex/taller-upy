// Define the base URL for the backend API.  During local
// development you can set this to the URL of your API Gateway or
// local mock (for example "http://localhost:3000").  When the
// frontend is deployed behind the same domain as the backend the
// value can be left empty.
//
// Nota: Para conectar con el backend sin modificarlo, actualice
// esta constante antes de compilar.  Por ejemplo:
// export const API_BASE_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com';
export const API_BASE_URL = 'https://cx2z4cu5q8.execute-api.us-east-1.amazonaws.com';

// === Configuración de Cognito ===
// Para activar el flujo de autenticación con Amazon Cognito, rellene
// los valores siguientes con los datos de su User Pool.  El dominio
// debe apuntar al “Hosted UI” (p. ej. my-domain.auth.us-east-1.amazoncognito.com),
// el clientId corresponde a la aplicación de usuario configurada en
// Cognito y redirectUri debe coincidir con la URL configurada como
// redireccionamiento en la interfaz de Amazon Cognito.
// Al dejar estas cadenas vacías, la SPA seguirá funcionando pero sin
// autenticación integrada; los usuarios deberán introducir su ID y
// token manualmente.
// /login?client_id=&response_type=code&scope=email+openid+phone&redirect_uri=http%3A%2F%2Flocalhost%3A5173
export const COGNITO_DOMAIN = 'us-east-1tur77qjjm.auth.us-east-1.amazoncognito.com';
export const COGNITO_CLIENT_ID = 'bf3lu8k2nf72luja03i7jig2a';
export const REDIRECT_URI = 'http://localhost:5173';
export const COGNITO_SCOPE = 'email openid phone';