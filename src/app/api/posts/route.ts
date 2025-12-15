import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { hasPermission } from '@/lib/rbac';
import { z, ZodError } from 'zod';

const postSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().min(1),
    image: z.string().optional(),
});

export async function GET(req: Request) {
    try {
        await dbConnect();
        const posts = await Post.find().populate('authorId', 'name email');
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canCreate = await hasPermission(session.user.role, 'create:posts');
        if (!canCreate) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, content, image } = postSchema.parse(body);

        await dbConnect();
        const post = await Post.create({
            title,
            slug,
            content,
            image,
            authorId: session.user.id,
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
