import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Sub-schemas ────────────────────────────────────────────── */

export interface IModelData {
  received: number;
  prd: number;
  pending: number;
}

const ModelDataSchema = new Schema<IModelData>(
  {
    received: { type: Number, default: 0 },
    prd: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ISubAssemblyRow {
  part: string;
  innova: IModelData;
  bmc: IModelData;
  crysta: IModelData;
}

const SubAssemblyRowSchema = new Schema<ISubAssemblyRow>(
  {
    part: { type: String, required: true },
    innova: { type: ModelDataSchema, default: () => ({}) },
    bmc: { type: ModelDataSchema, default: () => ({}) },
    crysta: { type: ModelDataSchema, default: () => ({}) },
  },
  { _id: false }
);

export interface IUnitPartsRow {
  part: string;
  qty1: number;
  qty2: number;
}

const UnitPartsRowSchema = new Schema<IUnitPartsRow>(
  {
    part: { type: String, required: true },
    qty1: { type: Number, default: 0 },
    qty2: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IEtiosRow {
  part: string;
  hbk: IModelData;
  sdn: IModelData;
}

const EtiosRowSchema = new Schema<IEtiosRow>(
  {
    part: { type: String, required: true },
    hbk: { type: ModelDataSchema, default: () => ({}) },
    sdn: { type: ModelDataSchema, default: () => ({}) },
  },
  { _id: false }
);

export interface ISignOff {
  tmName: string;
  tmNumber: string;
  designation: string;
  amName: string;
  glName: string;
  remarks: string;
  confirmed: boolean;
  tmSignature: string;
  amSignature: string;
  glSignature: string;
}

const SignOffSchema = new Schema<ISignOff>(
  {
    tmName: { type: String, required: true },
    tmNumber: { type: String, required: true },
    designation: { type: String, default: '' },
    amName: { type: String, default: '' },
    glName: { type: String, default: '' },
    remarks: { type: String, default: '' },
    confirmed: { type: Boolean, default: false },
    tmSignature: { type: String, default: '' },
    amSignature: { type: String, default: '' },
    glSignature: { type: String, default: '' },
  },
  { _id: false }
);

/* ── Main Entry schema ──────────────────────────────────────── */

export interface ITotals {
  totalReceived: number;
  totalProduction: number;
  totalPending: number;
}

export interface IEntry extends Document {
  date: string;
  shift: 'DAY' | 'NIGHT';
  status: 'draft' | 'submitted';
  createdBy: mongoose.Types.ObjectId;
  subAssembly: ISubAssemblyRow[];
  unitParts: IUnitPartsRow[];
  etios: IEtiosRow[];
  signOff: ISignOff | null;
  totals: ITotals;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntryModel extends Model<IEntry> {
  calcTotals(entry: IEntry): ITotals;
}

const EntrySchema = new Schema<IEntry>(
  {
    date: { type: String, required: true },
    shift: { type: String, enum: ['DAY', 'NIGHT'], required: true },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subAssembly: [SubAssemblyRowSchema],
    unitParts: [UnitPartsRowSchema],
    etios: [EtiosRowSchema],
    signOff: { type: SignOffSchema, default: null },
    totals: {
      totalReceived: { type: Number, default: 0 },
      totalProduction: { type: Number, default: 0 },
      totalPending: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

/* ── Static: calcTotals ─────────────────────────────────────── */

EntrySchema.statics.calcTotals = function (entry: IEntry): ITotals {
  let totalReceived = 0;
  let totalProduction = 0;
  let totalPending = 0;

  // Sum sub-assembly rows (innova + bmc + crysta)
  for (const row of entry.subAssembly) {
    for (const model of [row.innova, row.bmc, row.crysta]) {
      if (model) {
        totalReceived += model.received || 0;
        totalProduction += model.prd || 0;
        totalPending += model.pending || 0;
      }
    }
  }

  // Sum unit-parts rows (qty1 → production, qty2 → received)
  for (const row of entry.unitParts) {
    totalReceived += row.qty2 || 0;
    totalProduction += row.qty1 || 0;
  }

  // Sum etios rows (hbk + sdn)
  for (const row of entry.etios) {
    for (const model of [row.hbk, row.sdn]) {
      if (model) {
        totalReceived += model.received || 0;
        totalProduction += model.prd || 0;
        totalPending += model.pending || 0;
      }
    }
  }

  return { totalReceived, totalProduction, totalPending };
};

const Entry = mongoose.model<IEntry, IEntryModel>('Entry', EntrySchema);
export default Entry;
