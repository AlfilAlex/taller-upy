import { ListLotsFn } from '../functions/ListLotsFn.js';

export const ListLotHandler = async (event) => {
    const searchParams = event.queryStringParameters || {};
    try {
        const items = await ListLotsFn(searchParams);
        return {
            statusCode: items.statusCode,
            body: items.body
        };
    } catch (error) {
        console.error("Error in ListLotHandler:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}