import { DynamoClient } from '../utils/dynamoClient.js'

export const ListLotsFn = async (status, createdDay) => {
    const client = new DynamoClient();
    // UTILIZA EL CLIENTE PARA RECUPERAR LA INFORMACION
};