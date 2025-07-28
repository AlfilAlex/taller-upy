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

    async getItemById(itemId) {
        try {
            const result = await this.lotModel.get(itemId);
            if (!result) {
                throw new Error(`Item with ID ${itemId} not found`);
            }
            return result;
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
}
