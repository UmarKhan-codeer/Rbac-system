import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    title: string;
    slug: string;
    content: string;
    image?: string;
    authorId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        content: { type: String, required: true },
        image: { type: String },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
