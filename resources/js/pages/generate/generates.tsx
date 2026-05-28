 import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Upload } from "lucide-react";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Generations',
        href: '/dashboard/generations',
    },
];



export default function generates({ clothing }: { clothing: any[] }) {
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-400 flex flex-col items-center">
                        <Upload size={40} />
                        <p className="mt-2 text-sm">Your generated image will appear here</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    ); 
}
