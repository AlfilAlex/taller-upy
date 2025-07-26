import { LotModel } from "../utils/dynamoModel.js";

export const ReserveLotFn = async (lotId, userId) => {
    try {
        // Aquí se implementaría la lógica para reservar el lote
        const result = await LotModel.update({
            where: { id: lotId },
            data: { reserved: true, userId: userId }
        });
        return result;
    } catch (error) {
        console.error("Error reserving lot:", error);
        throw new Error("Could not reserve lot");
    }
}
