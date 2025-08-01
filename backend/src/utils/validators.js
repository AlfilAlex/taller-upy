import dynamoose from "dynamoose";

export const reserverIsNotTheSender = (senderId) => {
    return new dynamoose.Condition().where("ownerId").ne(senderId);
}