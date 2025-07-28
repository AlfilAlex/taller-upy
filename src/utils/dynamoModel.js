// src/models/lot.model.ts
import dynamoose from "dynamoose";

/* --- Catálogos --- */
const MATERIALS = ["madera", "metal", "vidrio", "textil", "plastico"];
const SCHEMES = ["donacion", "venta"];
const STATUSES = ["OPEN", "LOCKED", "PAID", "DELIVERED"];
const CONDITIONS = ["A", "B", "C"];

/* --- Esquema --- */
const LotSchema = new dynamoose.Schema(
    {
        /* Claves primarias */
        pk: { type: String, hashKey: true },                 // "lot#<uuid>"
        sk: { type: String, rangeKey: true, default: "meta" },

        /* Datos del lote + GSI #1  (material + status) */
        material: {
            type: String,
            enum: MATERIALS,
            required: true,
            index: {               // 👈 GSI1_MaterialStatus
                name: "GSI1_MaterialStatus",
                global: true,
                rangeKey: "status",
                project: true        // proyecta todos los atributos
            }
        },
        status: { type: String, enum: STATUSES, default: "OPEN" },

        condition: { type: String, enum: CONDITIONS, default: "B" },
        weightKg: { type: Number, validate: v => v > 0 && v <= 1_000 },

        scheme: { type: String, enum: SCHEMES, required: true },
        price: { type: Number, validate: v => v === 0 || v >= 1 },

        /* GSI #2  (ownerId + createdAt) */
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

        /* GSI #3  (receiverId + status) */
        receiverId: {
            type: String,
            index: {
                name: "GSI3_ReceiverStatus",
                global: true,
                rangeKey: "status",
                project: ["material", "status", "price", "scheme"]
            }
        },

        /* Dirección */
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
            // required: true,
            // validate: arr => Array.isArray(arr) && arr.length >= 2
        },

        /* Auxiliares */
        createdDay: {                       // GSI #5  (createdDay + createdAt)
            type: String,
            default: () => new Date().toISOString().slice(0, 10).replace(/-/g, ""),
            index: {
                name: "GSI5_CreatedDay",
                global: true,
                rangeKey: "createdAt",
                project: true
            }
        },
        // createdAt: { type: Date, default: Date.now }, // GSI #4  (createdAt + ownerId)
        // updatedAt: { type: Date, default: Date.now }, // GSI #6  (updatedAt + ownerId)

        expiresAt: { type: Number, ttl: true }   // TTL (epoch seconds)
    },
    {
        // 🗓 Timestamps automáticos; NO se incluyen en la definición de atributos
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        saveUnknown: false
    }

);

/* --- Modelo --- */
export const LotModel = dynamoose.model(process.env.DYNAMO_TABLE_NAME, LotSchema, {
    throughput: "ON_DEMAND",
    create: process.env.MUST_CREATE_TABLE || false,
});
