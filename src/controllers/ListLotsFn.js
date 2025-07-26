import { DynamoClient } from '../utils/dynamoClient'
export const ListLotsFn = (searchParams) => {
    const client = new DynamoClient();
    try {
        const items = client.getItem(searchParams);
        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    } catch (error) {
        console.error("Error listing lots:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }

}