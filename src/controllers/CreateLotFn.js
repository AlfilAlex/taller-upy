import { DynamoClient } from '../utils/dynamoClient'
import { Presigner } from '../utils/presigner';

const client = new DynamoClient();
const presigner = new Presigner();
export const createLotFn = (lot) => {

    client.putItem(lot.lotInfo);
    return {
        statusCode: 201,
        body: JSON.stringify(lot.lotInfo)
    }
}

export const generatePresignedUrl = async (imagesInfoArray) => {
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