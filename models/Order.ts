import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  userEmail: string;
  template: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalPrice: number;
  customerDetails: {
    businessName: string;
    contactEmail: string;
    contactPhone: string;
    requirements: string;
  };
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    customerDetails: {
      businessName: {
        type: String,
        required: true,
      },
      contactEmail: {
        type: String,
        required: true,
      },
      contactPhone: {
        type: String,
        required: true,
      },
      requirements: {
        type: String,
        required: true,
      },
    },
    paymentId: {
      type: String,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// ❌ Removed pre-save hook for orderNumber generation

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
