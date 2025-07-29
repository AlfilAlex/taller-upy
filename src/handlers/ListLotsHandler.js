import { ListLotsFn } from '../controllers/ListLotsFn.js';

export const ListLotHandler = async (event) => {
    const { status, day } = event.queryStringParameters || {};
    try {
        const items = await ListLotsFn(status, day);
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