import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserRole extends Document {
    userId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
}

const UserRoleSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
});

// Compound index to ensure a user has a role only once
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

const UserRole: Model<IUserRole> = mongoose.models.UserRole || mongoose.model<IUserRole>('UserRole', UserRoleSchema);

export default UserRole;
