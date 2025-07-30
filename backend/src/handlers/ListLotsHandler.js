import { ListLotsFn } from '../controllers/ListLotsFn.js';

export const ListLotHandler = async (event) => {
    const { status, createdDay } = event.queryStringParameters || {};
    
    try {
        const items = await ListLotsFn(status, createdDay);
        return {
            statusCode: items.statusCode,
            body: items.body,
            headers: {
                        "Content-Type": "application/json"
                }
        };
    } catch (error) {
        console.error("Error in ListLotHandler:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}