import Link from 'next/link';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-background border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="text-lg font-bold text-foreground">RBAC System</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            A secure, type-safe, and production-ready implementation of Role-Based Access Control.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="/api" className="text-sm text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
                            <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <Link href="https://github.com/UmarKhan-codeer" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://www.linkedin.com/in/umerrjaved/" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} RBAC System. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
