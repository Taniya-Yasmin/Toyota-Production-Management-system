import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string; // 'create', 'update', 'submit', 'delete'
  collectionName: string;
  documentId: mongoose.Types.ObjectId;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    previousState: {
      type: Schema.Types.Mixed,
    },
    newState: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
