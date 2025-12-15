'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { IPost } from '@/models/Post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PostWithAuthor extends Omit<IPost, '_id' | 'authorId'> {
    _id: string;
    authorId: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function PostDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<PostWithAuthor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchPost(params.id as string);
        }
    }, [params.id]);

    const fetchPost = async (id: string) => {
        try {
            const res = await fetch(`/api/posts/${id}`); // Assuming this endpoint exists or /api/posts handles it? 
            // Standard Next.js route for individual item usually needs specific handler.
            // If /api/posts/[id] exists, this is good. If checks /api/posts/?id=..., need to adjust.
            // Based on delete logic: fetch(`/api/posts/${id}`, ...), so GET /api/posts/${id} likely works or needs to be ensured.

            if (!res.ok) {
                if (res.status === 404) throw new Error('Post not found');
                throw new Error('Failed to fetch post');
            }

            const data = await res.json();
            setPost(data);
        } catch (error: any) {
            console.error('Failed to fetch post:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground">Loading post...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold text-destructive">{error || 'Post not found'}</h2>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
            </Button>

            <Card className="overflow-hidden">
                <div className="relative h-64 w-full bg-muted">
                    <img
                        className="h-full w-full object-cover"
                        src={post.image || 'https://via.placeholder.com/800x400'}
                        alt={post.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x400?text=No+Image';
                        }}
                    />
                </div>
                <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.authorId.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        {post.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        {/* 
                           Rendering content safely. 
                           If content is rich text html, use dangerouslySetInnerHTML. 
                           If plain text, just render. 
                           Assuming plain text for now based on card view 'line-clamp'.
                        */}
                        <p className="whitespace-pre-wrap leading-relaxed text-lg text-muted-foreground">
                            {post.content}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
