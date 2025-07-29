import { DynamoClient } from '../utils/dynamoClient.js'

export const ListLotsFn = async (status, createdDay) => {
    const client = new DynamoClient();
    try {
        const items = await client.getItem(status, createdDay);
        return {
            statusCode: 200,
            body: JSON.stringify(items),
            headers: {
                "Content-Type": "application/json"
            }
        };
    } catch (error) {
        console.error("Error listing lots:", error);
        return {
            statusCode: 500,
            body: { message: "Internal Server Error" },
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
};