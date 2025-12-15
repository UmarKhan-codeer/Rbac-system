'use client';

import AppLayout from '@/components/dashboard/app-layout';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
