import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRolePermission extends Document {
    roleId: mongoose.Types.ObjectId;
    permissionId: mongoose.Types.ObjectId;
}

const RolePermissionSchema: Schema = new Schema({
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permissionId: { type: Schema.Types.ObjectId, ref: 'Permission', required: true },
});

// Compound index to ensure a role has a permission only once
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const RolePermission: Model<IRolePermission> = mongoose.models.RolePermission || mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);

export default RolePermission;
