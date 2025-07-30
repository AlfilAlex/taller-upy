
import dynamoose from "dynamoose";


const MATERIALS = ["madera", "metal", "vidrio", "textil", "plastico"];
const SCHEMES = ["donacion", "venta"];
const STATUSES = ["OPEN", "LOCKED", "PAID", "DELIVERED"];
const CONDITIONS = ["A", "B", "C"];


const LotSchema = new dynamoose.Schema(
    {

        pk: { type: String, hashKey: true },
        sk: { type: String, rangeKey: true, default: "meta" },


        material: {
            type: String,
            enum: MATERIALS,
            required: true,
            index: {
                name: "GSI1_MaterialStatus",
                global: true,
                rangeKey: "status",
                project: true
            }
        },
        status: { type: String, enum: STATUSES, default: "OPEN" },

        condition: { type: String, enum: CONDITIONS, default: "B" },
        weightKg: { type: Number, validate: v => v > 0 && v <= 1_000 },

        scheme: { type: String, enum: SCHEMES, required: true },
        price: { type: Number, validate: v => v === 0 || v >= 1 },


        ownerId: {
            type: String,
            required: true,
            index: {
                name: "GSI2_OwnerCreated",
                global: true,
                rangeKey: "createdAt",
                project: ["material", "status", "price", "scheme"]
            }
        },


        receiverId: {
            type: String,
            index: {
                name: "GSI3_ReceiverStatus",
                global: true,
                rangeKey: "status",
                project: ["material", "status", "price", "scheme"]
            }
        },


        address: {
            type: Object,
            schema: {
                line1: { type: String, required: true },
                city: { type: String, default: "Mérida" },
                lat: Number,
                lng: Number
            }
        },

        images: {
            type: Array,
            schema: [String],
            required: false,


        },


        createdDay: {
            type: String,
            default: () => new Date().toISOString().slice(0, 10).replace(/-/g, ""),
            index: {
                name: "GSI5_CreatedDay",
                global: true,
                rangeKey: "status",
                project: true
            }
        },



        expiresAt: { type: Number, ttl: true }
    },
    {

        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        saveUnknown: false
    }

);


export const LotModel = dynamoose.model(process.env.DYNAMO_TABLE_NAME, LotSchema, {
    throughput: "ON_DEMAND",
    create: process.env.MUST_CREATE_TABLE || false,
});
