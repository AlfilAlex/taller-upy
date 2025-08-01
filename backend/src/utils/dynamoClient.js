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

    async getItem(status, createdDay) {
        try {
            if (!createdDay) {
                const result = await this.lotModel.scan('status').eq(status).exec();
                return result;
            }
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
