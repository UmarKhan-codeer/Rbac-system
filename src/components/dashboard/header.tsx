'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                {/* Add breadcrumbs or page title here if needed */}
            </div>
            <div className="flex items-center gap-4">
                {/* Add notifications, search, etc. here */}
            </div>
        </header>
    );
}
