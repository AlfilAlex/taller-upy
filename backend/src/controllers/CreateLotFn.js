import { DynamoClient } from '../utils/dynamoClient.js'
import { Presigner } from '../utils/presigner.js';

const client = new DynamoClient();
const presigner = new Presigner();
export const CreateLotFn = async (lot, userId) => {
    const createdDay = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    await client.putItem({ ...lot, pk: `lot#${lot.id}`, sk: "meta", createdDay, ownerId: userId });
    return {
        statusCode: 201,
        body: JSON.stringify(lot)
    }
}

export const GeneratePresignedUrlFn = async (imagesInfoArray) => {
    const presignedUrls = await Promise.all(imagesInfoArray.map(async (imagesInfo) => {
        const { mimeType, fileSize, sha256, userId } = imagesInfo;
        const presignedUrl = await presigner.presign(mimeType, fileSize, sha256, userId);
        return presignedUrl;
    }));
    return {
        statusCode: 200,
        body: JSON.stringify(presignedUrls)
    }
}