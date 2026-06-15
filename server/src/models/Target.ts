import mongoose, { Schema, Document } from 'mongoose';

export interface ITarget extends Document {
  partName: string;
  lineType: 'SubAssembly' | 'UnitParts' | 'Etios';
  targetQty: number; // target production quantity per shift
  shift: 'DAY' | 'NIGHT';
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema = new Schema<ITarget>(
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
    targetQty: {
      type: Number,
      required: true,
      default: 50,
    },
    shift: {
      type: String,
      enum: ['DAY', 'NIGHT'],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Unique combination of partName + shift + lineType
TargetSchema.index({ partName: 1, shift: 1, lineType: 1 }, { unique: true });

const Target = mongoose.model<ITarget>('Target', TargetSchema);
export default Target;
