import { createLotFn } from '../controllers/CreateLotFn';

export const generatePresignedUrlHandler = async (event) => {
    if (!event || !event.body) {
        return {
            statusCode: 400,
            body: "Invalid request format"
        };
    }
    try {
        const imagesInfoArray = JSON.parse(event.body);
        const response = await generatePresignedUrl(imagesInfoArray);
        return {
            statusCode: response.statusCode,
            body: response.body
        };
    } catch (error) {
        console.error("Error generating presigned URLs:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}

export const createLotHandler = async (event) => {
    if (!event || !event.body) {
        return {
            statusCode: 400,
            body: "Invalid request format"
        };
    }
    try {
        const lot = JSON.parse(event.body);
        if (!lot || !lot.lotInfo || !lot.lotInfo.userId) {
            return {
                statusCode: 400,
                body: "Invalid lot information"
            };
        }
        const response = createLotFn(lot);
        return {
            statusCode: response.statusCode,
            body: response.body
        };
    } catch (error) {
        console.error("Error creating lot:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}