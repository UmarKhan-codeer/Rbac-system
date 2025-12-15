import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="mb-6 text-gray-600">
                    You do not have permission to access the dashboard. Only admins and superadmins are allowed.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}