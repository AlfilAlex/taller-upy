import { CreateLotFn, GeneratePresignedUrlFn } from '../controllers/CreateLotFn.js';
import { getInfoFromToken } from '../utils/auth.js';


export const createLotHandler = async (event) => {
    console.log(JSON.stringify(event));
    const token = event.headers?.authorization;
    if (!token) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        };
    }
    const { sub: producerUserId } = getInfoFromToken(token);
    if (!event || !event.body) {
        return {
            statusCode: 400,
            body: "Invalid request format"
        };
    }
    try {
        const lot = JSON.parse(event.body);
        const isValidLot = validateAllLotInfo(lot);
        if (!isValidLot) {
            return {
                statusCode: 400,
                body: { mensage: "Invalid lot information", lot }
            };
        }
        const response = await CreateLotFn(lot, producerUserId);
        return {
            statusCode: response.statusCode,
            body: response.body,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error("Error creating lot:", error);
        return {
            statusCode: 500,
            body: "Internal Server Error"
        };
    }
}



const validateAllLotInfo = (lot) => {
    if (!lot.material) {
        console.error("Invalid material:", lot.material);
        return false;
    }
    if (!lot.status) {
        console.error("Invalid status:", lot.status);
        return false;
    }
    if (!lot.scheme) {
        console.error("Invalid scheme:", lot.scheme);
        return false;
    }
    if (typeof lot.price !== 'number' || (lot.price < 0 && lot.price !== 0)) {
        console.error("Invalid price:", lot.price);
        return false;
    }
    return true;
}