// models/lot.model.js
import * as dynamoose from "dynamoose";         //  ❱❱  si usas CommonJS: const dynamoose = require("dynamoose");

const MATERIALS = ["madera", "metal", "vidrio", "textil", "plastico"];
const SCHEMES = ["donacion", "venta"];
const STATUSES = ["OPEN", "LOCKED", "PAID", "DELIVERED"];
const CONDITIONS = ["A", "B", "C"];

/**
 * Esquema Dynamoose
 */
const LotSchema = new dynamoose.Schema(
    {
        pk: { type: String, hashKey: true },           // ej. "lot#<uuid>"
        sk: { type: String, rangeKey: true, default: "meta" },

        material: {
            type: String,
            enum: MATERIALS,                                    // ⬅ validación
            required: true
        },
        condition: {
            type: String,
            enum: CONDITIONS,
            default: "B"
        },
        weightKg: {
            type: Number,
            validate: (v) => v > 0 && v <= 1000                // 1 kg – 1 t
        },

        scheme: { type: String, enum: SCHEMES, required: true },
        price: {
            type: Number,
            validate: (v) => v === 0 || v >= 1                 // 0 = donación
        },
        status: { type: String, enum: STATUSES, default: "OPEN" },
        lockUntil: { type: Date },

        ownerId: { type: String, required: true },          // Generador
        receiverId: { type: String },                          // Receptor (post-reserva)

        address: {
            type: Object,
            schema: {
                line1: { type: String, required: true },
                city: { type: String, default: "Mérida" },
                lat: { type: Number },
                lng: { type: Number }
            }
        },

        images: {
            type: Array,
            schema: [String],
            required: true,
            validate: (arr) => Array.isArray(arr) && arr.length >= 2
        },

        createdAt: { type: Date, default: () => new Date() },
        createdDay: { type: String, default: () => new Date().toISOString().split("T")[0].replace(/-/g, "") },
        updatedAt: { type: Date, default: () => new Date() },
        expiresAt: { type: Number, ttl: true }               // epoch segs – TTL DynamoDB
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        saveUnknown: false
    }
);

/* ---------- Índices globales ---------- */

// GSI1: material + status  ➜  para marketplace filtrado
LotSchema.index({
    name: "GSI1_MaterialStatus",
    global: true,
    hashKey: "material",
    rangeKey: "status",
    project: true          // proyecta todos los atributos
});

// GSI2: ownerId + createdAt  ➜  "Mis publicaciones"
LotSchema.index({
    name: "GSI2_OwnerCreated",
    global: true,
    hashKey: "ownerId",
    rangeKey: "createdAt",
    project: ["material", "status", "price", "scheme"]   // proyección reducida
});

// GSI3: receiverId + status  ➜  "Mis reservas"
LotSchema.index({
    name: "GSI3_ReceiverStatus",
    global: true,
    hashKey: "receiverId",
    rangeKey: "status",
    project: ["material", "status", "price", "scheme"]   // proyección reducida
});

// Al insertar, agrega un atributo extra con el día (bucket) yyyyMMdd
LotSchema.index({
    name: "GSI5_CreatedDay",
    global: true,
    hashKey: "createdDay",   // distribuye carga por día
    rangeKey: "createdAt",   // orden cronológico dentro del día
    project: true
});



/* ---------- Modelo ---------- */
export const LotModel = dynamoose.model("Lots", LotSchema, {
    throughput: "ON_DEMAND"   // PAY_PER_REQUEST
});
