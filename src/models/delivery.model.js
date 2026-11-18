import mongoose from 'mongoose';
import fileSchema from './file.schema.js';
import { DELIVERY_STATUS, DELIVERY_PRIORITY } from '../constants/index.js';

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: [true, 'El pedido es obligatorio'] },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: Object.values(DELIVERY_STATUS), default: DELIVERY_STATUS.PENDING },
    priority: { type: String, enum: Object.values(DELIVERY_PRIORITY), default: DELIVERY_PRIORITY.NORMAL },
    assignedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    receipts: { type: [fileSchema], default: [] },
  },
  { timestamps: true }
);

deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ driver: 1 });
deliverySchema.index({ order: 1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
