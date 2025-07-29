
import { reserveLotsHandler } from './src/handlers/ReserveLotsHandler.js';
import { createLotHandler } from './src/handlers/CreteLotHandlers.js';
import { ListLotHandler } from './src/handlers/ListLotsHandler.js';


export const createLot = createLotHandler;
// export const GeneratePresignedUrlFn = GeneratePresignedUrlFnHandler;
export const listLots = ListLotHandler;
export const reserveLots = reserveLotsHandler;
