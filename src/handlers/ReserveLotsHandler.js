import { ReserveLotFn } from '../controllers/ReserveLotFn.js';

export const reserveLotsHandler = async (event, context) => {
    const { lotId, userId } = JSON.parse(event.body);

    try {
        const result = await ReserveLotFn(lotId, userId);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Error reserving lots:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}
