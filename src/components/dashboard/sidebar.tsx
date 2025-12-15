'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, FileText, Users, Shield, Key, LogOut, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'editor', 'user'] },
        { name: 'Posts', href: '/dashboard/posts', icon: FileText, roles: ['superadmin', 'admin', 'editor'] },
        { name: 'Users', href: '/admin/users', icon: Users, roles: ['superadmin', 'admin'] },
        { name: 'Roles', href: '/admin/roles', icon: Shield, roles: ['superadmin', 'admin'] },
        { name: 'Permissions', href: '/admin/permissions', icon: Key, roles: ['superadmin', 'admin'] },
    ];

    const filteredNavigation = navigation.filter(item =>
        session?.user?.role && item.roles.includes(session.user.role)
    );

    return (
        <div className={cn("flex h-full flex-col bg-card border-r border-border", className)}>
            <Link href="/" className="flex h-16 items-center px-6 border-b border-border hover:bg-accent/50 transition-colors">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-bold text-foreground">RBAC Admin</span>
            </Link>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border bg-card/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize truncate">{session?.user?.role}</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </div>
    );
}
