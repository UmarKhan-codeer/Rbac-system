'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, User, ArrowRight } from 'lucide-react';
import { IPost } from '@/models/Post';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PostWithAuthor extends Omit<IPost, '_id' | 'authorId'> {
    _id: string;
    authorId: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function PostsPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold">Delete this post?</span>
                <span className="text-sm text-gray-500">This action cannot be undone.</span>
                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            toast.dismiss(t.id);
                            performDelete(id);
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const performDelete = async (id: string) => {
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/posts/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setPosts(posts.filter((post) => post._id !== id));
                    resolve('Post deleted successfully');
                } else {
                    reject('Failed to delete post');
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                reject('Error deleting post');
            }
        });

        toast.promise(deletePromise, {
            loading: 'Deleting post...',
            success: 'Post deleted successfully!',
            error: 'Failed to delete post',
        });
    }

    const canCreate = ['superadmin', 'admin', 'editor'].includes(session?.user?.role || '');
    const canEdit = ['superadmin', 'admin', 'editor'].includes(session?.user?.role || '');
    const canDelete = ['superadmin', 'admin'].includes(session?.user?.role || '');

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Posts</h1>
                    <p className="text-muted-foreground mt-1">Manage blog posts and content.</p>
                </div>
                {canCreate && (
                    <Button asChild>
                        <Link href="/dashboard/posts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No posts found. Create one to get started.
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post._id} className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full bg-muted">
                                <img
                                    className="h-full w-full object-cover"
                                    src={post.image || 'https://via.placeholder.com/400x200'}
                                    alt={post.title}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image';
                                    }}
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1 text-xl">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                    {post.content}
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{post.authorId.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-muted/50 p-2 flex flex-col gap-2 border-t">
                                <Button variant="secondary" className="w-full h-9" asChild>
                                    <Link href={`/dashboard/posts/${post._id}`}>
                                        Read More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                {(canEdit || canDelete) && (
                                    <div className="flex w-full gap-2">
                                        {canEdit && (
                                            <Button variant="ghost" className="flex-1 h-8 text-xs" asChild>
                                                <Link href={`/dashboard/posts/${post._id}/edit`}>
                                                    <Edit className="mr-2 h-3 w-3" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="ghost"
                                                className="flex-1 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(post._id)}
                                            >
                                                <Trash2 className="mr-2 h-3 w-3" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
