import { LotModel } from "./dynamoModel.js";


export class DynamoClient {
    constructor() {
        this.lotModel = LotModel;
    }

    async putItem(item) {
        try {
            const result = await this.lotModel.create(item);
            return result;
        } catch (error) {
            console.error(`Failed to put item: ${JSON.stringify(item)}`);
            console.error("Error putting item:", error);
            throw error;
        }
    }

    async getItemById(status, createdDay) {
        try {
            // const result = await this.lotModel.get(itemId);
            const openLotsToday = await LotModel
                .query("createdDay").eq(createdDay)
                .where("status").eq(status)
                .using("GSI5_CreatedDay")
                .exec();
            if (!openLotsToday) {
                throw new Error(`Item with ID ${itemId} not found`);
            }
            return openLotsToday;
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    }

    async updateItem(item) {
        try {
            const result = await this.lotModel.update(item);
            return result;
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    }

    async deleteItem(item) {
        try {
            const result = await this.lotModel.delete(item);
            return result;
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }

    /**
     * Obtiene una lista de lotes filtrados por estado y día de creación.
     * Esta operación utiliza el índice global secundario GSI5_CreatedDay,
     * donde la clave de partición es `createdDay` (con formato YYYYMMDD)
     * y la clave de ordenación es `status`.  Si no se proporciona
     * `status` se devuelven todos los lotes del día indicado.
     *
     * @param {string | undefined} status   Estado del lote (OPEN, LOCKED, etc.)
     * @param {string | undefined} createdDay Día en formato YYYYMMDD.  Si es
     *                                        `undefined` se devolverán todos
     *                                        los lotes sin filtrar por fecha.
     * @returns {Promise<Array>} Lista de lotes que cumplen los filtros.
     */
    async getItem(status, createdDay) {
        try {
            // Si no se especifica createdDay, realizamos un scan completo.
            if (!createdDay) {
                // Dynamoose recomienda usar scan para recorridos completos.
                const result = await this.lotModel.scan('status').eq(status).exec();
                return result;
            }
            // Construye la consulta en el índice de fecha
            let query = this.lotModel.query('createdDay').eq(createdDay).using('GSI5_CreatedDay');
            if (status) {
                query = query.where('status').eq(status);
            }
            const result = await query.exec();
            return result;
        } catch (error) {
            console.error('Error querying items:', error);
            throw error;
        }
    }
}
