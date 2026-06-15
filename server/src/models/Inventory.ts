import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  partName: string;
  lineType: 'SubAssembly' | 'UnitParts' | 'Etios';
  currentStock: number;
  minThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    partName: {
      type: String,
      required: true,
      index: true,
    },
    lineType: {
      type: String,
      enum: ['SubAssembly', 'UnitParts', 'Etios'],
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  { timestamps: true }
);

// Compound unique index for partName + lineType
InventorySchema.index({ partName: 1, lineType: 1 }, { unique: true });

const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
export default Inventory;
