import { reserveLotsFn } from '../services/reserveLotsService';

export const reserveLotsHandler = async (event, context) => {
    const { lotId, userId } = JSON.parse(event.body);

    try {
        // Aquí se llamaría a la función que maneja la reserva de lotes
        const result = await reserveLotsFn(lotId, userId);

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
