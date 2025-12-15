'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Shield, Users, Layout, Fingerprint, Database, ArrowRight, LogOut, CheckCircle, Code2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/footer';

interface Post {
    _id: string;
    title: string;
    content: string;
    image?: string;
    authorId: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function HomePage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="mx-auto max-w-4xl">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                                v1.0 • Dark Mode Enabled
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                                Next-Generation <br />
                                <span className="text-foreground">Identity & Access</span>
                            </h1>
                            <p className="mt-8 text-xl leading-8 text-muted-foreground mb-12 max-w-2xl mx-auto">
                                A production-grade RBAC architecture built on Next.js 15, MongoDB, and NextAuth.js.
                                Featuring seamless role management, secure authentication, and a polished dark-mode interface.
                            </p>
                            {!session && (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                                            Start for Free
                                        </Button>
                                    </Link>
                                    <Link href="/login" className="w-full sm:w-auto">
                                        <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base bg-background/50 backdrop-blur border-border hover:bg-accent/50">
                                            Live Demo
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Posts Section (Only when logged in) */}
                {session && (
                    <section className="py-20 bg-accent/5 border-y border-border/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">Latest Updates</h2>
                                    <p className="text-muted-foreground mt-2">Exclusive content for authenticated users</p>
                                </div>
                                {['superadmin', 'admin', 'editor'].includes(session.user.role || '') && (
                                    <Link href="/dashboard/posts/create">
                                        <Button className="shadow-lg shadow-primary/20">
                                            Create Post
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            ) : (
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {posts.map((post) => (
                                        <Card key={post._id} className="flex flex-col overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <div className="relative h-48 w-full bg-muted overflow-hidden">
                                                <img
                                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                    src={post.image || 'https://via.placeholder.com/800x400'}
                                                    alt={post.title}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x400?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <CardHeader className="flex-none">
                                                <div className="flex justify-between items-start gap-4">
                                                    <CardTitle className="line-clamp-1 text-xl">{post.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 min-h-[100px]">
                                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                                    {post.content}
                                                </p>
                                                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <span>{post.authorId?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <div className="p-6 pt-0 mt-auto">
                                                <Link href={`/posts/${post._id}`} className="w-full block">
                                                    <Button variant="secondary" className="w-full group">
                                                        Read More
                                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    ))}
                                    {posts.length === 0 && (
                                        <div className="col-span-full text-center py-20 bg-card/50 rounded-2xl border border-dashed border-border">
                                            <p className="text-muted-foreground">No posts found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Features Section */}
                <section className="py-32 bg-accent/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
                            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Built for Security
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Users,
                                    title: "Dynamic RBAC Engine",
                                    desc: "Define granular permissions and role hierarchies with precision. Our schema-driven approach ensures scalability as your organization grows."
                                },
                                {
                                    icon: Lock,
                                    title: "Enterprise-Grade Security",
                                    desc: "Fortified with middleware protection, rigorous type safety, and bcrypt hashing. Your data remains secure behind industry-standard authentication protocols."
                                },
                                {
                                    icon: Code2,
                                    title: "Modern Developer Experience",
                                    desc: "Built with Server Actions, Shadcn UI, and Tailwind CSS. Experience the speed of a fully optimized Next.js 15 application with a beautiful dark theme."
                                }
                            ].map((feature, i) => (
                                <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all duration-300">
                                    <CardHeader>
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        <CardDescription className="text-muted-foreground text-base mt-2">
                                            {feature.desc}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                                    Architected for Scalability
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    The RBAC System isn't just a template—it's a comprehensive reference implementation for modern web security. Designed to handle complex permission logic while maintaining peak performance.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        "Server-Side Rendering with Next.js 15",
                                        "Type-Safe Database Operations with Mongoose",
                                        "Responsive Dark Mode Interface",
                                        "Secure API Routes with Middleware Protection"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-foreground">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-3xl bg-gradient-to-tr from-primary/20 to-accent/20 p-8 flex items-center justify-center overflow-hidden border border-border/50 shadow-2xl">
                                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                                    <Database className="h-48 w-48 text-primary/40 relative z-10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
