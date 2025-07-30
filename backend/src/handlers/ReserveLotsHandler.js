import { ReserveLotFn } from '../controllers/ReserveLotFn.js';
import { getInfoFromToken } from '../utils/auth.js';

export const reserveLotsHandler = async (event, context) => {
    console.log(JSON.stringify(event));
    const token = event.headers?.authorization;
    if (!token) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        };
    }
    const { sub: receiverId } = getInfoFromToken(token);
    const { lotId } = event.pathParameters || {};
    if (!lotId) {
        return {
            statusCode: 400,
            body: "Invalid request format"
        };
    }

    try {
        const result = await ReserveLotFn(lotId, receiverId);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                "Content-Type": "application/json"
            }
        };
    } catch (error) {
        if (error.message === "You cannot reserve a lot that you own") {
            return {
                statusCode: 403,
                body: { error: error.message },
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }
        console.error("Error reserving lots:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}
