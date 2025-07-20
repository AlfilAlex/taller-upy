import { docClient } from './dynamoClient'
import { PutCommand } from "@aws-sdk/lib-dynamodb";


export const createLotFn = (event) => {
    docClient.send(new PutCommand({
        TableName: process.env.LOT_TABLE_NAME,
        Item: event.lotInfo,
    }))
    return {
        statusCode: 201,
        body: JSON.stringify(event.lotInfo)
    }
}