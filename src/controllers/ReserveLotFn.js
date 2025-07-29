import { LotModel } from "../utils/dynamoModel.js";
import { reserverIsNotTheSender } from "../utils/validators.js";

export const ReserveLotFn = async (lotId, receiverId) => {
    try {
        // Aquí se implementaría la lógica para reservar el lote
        console.log(`Reserving lot with ID: ${lotId} for receiver ID: ${receiverId}`);
        const condition = reserverIsNotTheSender(receiverId);
        const result = await LotModel.update({ pk: `lot#${lotId}`, sk: `meta` },
            { receiverId: receiverId, status: "LOCKED" },
            { condition: condition }
        );
        return result;
    } catch (error) {
        console.error("Error reserving lot:", error);
        if (error.name === 'ConditionalCheckFailedException') {
            throw new Error("You cannot reserve a lot that you own");
        }
        throw new Error("Could not reserve lot");
    }
}
