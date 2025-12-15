import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPermission extends Document {
    name: string;
    description?: string;
}

const PermissionSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
});

const Permission: Model<IPermission> = mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);

export default Permission;
