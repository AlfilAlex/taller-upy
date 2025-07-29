import * as jose from 'jose'
export const getInfoFromToken = (token) => {
    try {
        const decoded = jose.decodeJwt(token);
        return decoded;
    } catch (error) {
        console.error("Error decoding token:", error);
        throw new Error("Invalid token");
    }
}