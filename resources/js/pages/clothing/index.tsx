import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ImagePlay, Trash, Tag } from 'lucide-react';
import { route } from 'ziggy-js';
import CustomModelForm from '@/components/custom-model-form';
import CustomModelFormEdit from '@/components/CustomModelFormEdit';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clothing', href: '/clothing' },
];

interface ClothingItem {
    id: number;
    name: string;
    category?: string;
    description?: string;
    back_description?: string;
    tags?: string;
    front_image?: string;
    back_image?: string;
    created_at?: string;
}

interface IndexProps {
    clothing: ClothingItem[];
}

const CATEGORY_COLOURS: Record<string, string> = {
    top:        'bg-blue-100 text-blue-700',
    bottom:     'bg-purple-100 text-purple-700',
    dress:      'bg-pink-100 text-pink-700',
    outerwear:  'bg-orange-100 text-orange-700',
    knitwear:   'bg-yellow-100 text-yellow-700',
    activewear: 'bg-green-100 text-green-700',
    formal:     'bg-gray-200 text-gray-700',
    accessory:  'bg-teal-100 text-teal-700',
};

export default function Index({ clothing }: IndexProps) {
    const [search, setSearch] = useState('');

    const filtered = (Array.isArray(clothing) ? clothing : []).filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (item.tags ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clothing Manager" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <CustomModelForm />
                    <input
                        type="text"
                        placeholder="Search by name, category, or tag…"
                        className="border rounded-lg px-3 py-1.5 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="ml-auto text-xs text-gray-400">
                        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-100">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-4 py-3 w-16">Image</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 max-w-xs">AI Description</th>
                                <th className="px-4 py-3">Tags</th>
                                <th className="px-4 py-3 text-center">Try-On</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                                        No clothing items yet. Click <strong>+ New Item</strong> to add your first garment.
                                    </td>
                                </tr>
                            )}
                            {filtered.map((item, idx) => (
                                <tr
                                    className="text-xs hover:bg-gray-50 transition"
                                    key={item.id ?? idx}
                                >
                                    {/* Thumbnail */}
                                    <td className="px-4 py-3">
                                        <div className="relative group w-12 h-12">
                                            <img
                                                src={item.front_image
                                                    ? `/storage/${item.front_image}`
                                                    : '/images/product/web-image.png'}
                                                alt={item.name}
                                                className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                            />
                                            {item.back_image && (
                                                <img
                                                    src={`/storage/${item.back_image}`}
                                                    alt="back"
                                                    className="absolute inset-0 h-12 w-12 object-cover rounded-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition"
                                                />
                                            )}
                                        </div>
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>

                                    {/* Category badge */}
                                    <td className="px-4 py-3">
                                        {item.category ? (
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${CATEGORY_COLOURS[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {item.category}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>

                                    {/* AI Description (truncated) */}
                                    <td className="px-4 py-3 text-gray-500 max-w-xs">
                                        <p className="line-clamp-2 leading-relaxed">
                                            {item.description ?? '—'}
                                        </p>
                                    </td>

                                    {/* Tags */}
                                    <td className="px-4 py-3">
                                        {item.tags ? (
                                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                                                {item.tags.split(',').slice(0, 4).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px]"
                                                    >
                                                        <Tag size={8} />
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>

                                    {/* Generate / Try-On */}
                                    <td className="px-4 py-3 text-center">
                                        <Link href={`/dashboard/generates/${item.id}`} title="Virtual Try-On">
                                            <ImagePlay className="inline h-7 w-7 text-blue-500 hover:text-blue-700 transition" />
                                        </Link>
                                    </td>

                                    {/* Created */}
                                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A'}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 justify-center">
                                            <CustomModelFormEdit item={item} />
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this item? This cannot be undone.')) {
                                                        router.delete(route('dashboard.clothing.destroy', { id: item.id }));
                                                    }
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition cursor-pointer"
                                                title="Delete item"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}