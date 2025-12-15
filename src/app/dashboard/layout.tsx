'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/dashboard/app-layout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role) {
            if (!['superadmin', 'admin', 'editor'].includes(session.user.role)) {
                router.push('/unauthorized');
            }
        }
    }, [session, status, router]);

    if (status === 'loading') return <div className="p-8">Loading...</div>;

    if (!session) return null;

    return <AppLayout>{children}</AppLayout>;
}
