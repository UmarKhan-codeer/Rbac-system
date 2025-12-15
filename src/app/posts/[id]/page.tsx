'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Shield, LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/footer';

interface PostWithAuthor {
    _id: string;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    authorId: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function PublicPostPage() {
    const { data: session } = useSession();
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
            const res = await fetch(`/api/posts/${id}`);
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
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar session={session} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading post...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar session={session} />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-xl font-semibold text-destructive">{error || 'Post not found'}</h2>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar session={session} />

            <main className="flex-1 py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent -ml-2 mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>

                    <Card className="overflow-hidden border-border/60 shadow-lg">
                        <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
                            <img
                                className="h-full w-full object-cover"
                                src={post.image || 'https://via.placeholder.com/800x400'}
                                alt={post.title}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x400?text=No+Image';
                                }}
                            />
                        </div>
                        <CardHeader className="space-y-6 md:px-8 md:pt-8">
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 bg-accent/50 px-3 py-1 rounded-full">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-foreground">{post.authorId.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                            <CardTitle className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                {post.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="md:px-8 md:pb-8">
                            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                    {post.content}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function Navbar({ session }: { session: any }) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">RBAC System</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <>
                                {['superadmin', 'admin', 'editor'].includes(session.user.role || '') && (
                                    <Link href="/dashboard">
                                        <Button variant="default" className="font-semibold shadow-lg shadow-primary/20">
                                            Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">Logout</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="font-semibold shadow-lg shadow-primary/20">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
