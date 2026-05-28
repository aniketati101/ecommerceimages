import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { SquareArrowOutUpRight, Plus, MoveRight } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {

    const cards = [
        {
        title: "Product to Model",
        url: '#',
        desc: "Turn wearable product images into professional model photography",
        images: ["/storage/clothing/JY9sUhoemeSWH4rfqGGI7KQ266EEJplGoaBtBpYT.png", "/storage/clothing/AskWU5GdPGOTIKa2PXQMiBN18hiFfVQIFcNhoT6d.jpg", "/storage/clothing/7Yk4vWOIBZU6JLhc4zqjRXAvPgSjQqXtbchX8V8S.jpg"],
        },
        {
        title: "Try-On Studio",
        url: '/dashboard/clothing/',
        desc: "Visualize how an outfit worn by one model looks on different models",
        images: ["/storage/clothing/7Yk4vWOIBZU6JLhc4zqjRXAvPgSjQqXtbchX8V8S.jpg", "/storage/clothing/AskWU5GdPGOTIKa2PXQMiBN18hiFfVQIFcNhoT6d.jpg", "/storage/clothing/JY9sUhoemeSWH4rfqGGI7KQ266EEJplGoaBtBpYT.png"],
        },
        {
        title: "Model Creation",
        url: '/dashboard/virtual-models/',
        desc: "Create a unique AI model using a text prompt or reference image",
        images: ["/storage/uploads/models/9gVHkCk7ik5fhm3QqIoZK1o9xqoiVtDqWGyKo4A3.png", "/storage/uploads/models/D0wt4wGSWuM3V3meZmTkXNKfD28FdoVD3aQ8Ur0w.png", "/storage/uploads/models/JPyFqYGxijrEjgQ1I3xuk3JOu5HXP9mQJz8eChW9.png"],
        },
        {
        title: "Model Swap",
        url: '#',
        desc: "Change the model while preserving pose and garment details",
        images: ["/storage/uploads/models/JPyFqYGxijrEjgQ1I3xuk3JOu5HXP9mQJz8eChW9.png", "/storage/uploads/models/ESKetvhJgMXCZqNqbKb6ERl2BJcyhnkGhNPjuzRQ.png",  "/storage/uploads/models/D0wt4wGSWuM3V3meZmTkXNKfD28FdoVD3aQ8Ur0w.png"],
        },
    ];
    const recentImages = [
        "/storage/uploads/models/9gVHkCk7ik5fhm3QqIoZK1o9xqoiVtDqWGyKo4A3.png",
        "/storage/uploads/models/D0wt4wGSWuM3V3meZmTkXNKfD28FdoVD3aQ8Ur0w.png",
        "/storage/uploads/models/JPyFqYGxijrEjgQ1I3xuk3JOu5HXP9mQJz8eChW9.png",
        "/storage/uploads/models/ESKetvhJgMXCZqNqbKb6ERl2BJcyhnkGhNPjuzRQ.png",
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="min-h-screen px-6 py-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <h1 className="text-3xl md:text-4xl font-semibold text-center text-gray-800">
                            What will your next photoshoot be?
                        </h1>

                        {/* Prompt Box */}
                        <div className="mt-8">
                            <div className="relative bg-[#f3f4f6] border border-[#99a1af] rounded-xl p-4">
                                <span className="absolute top-2 right-3 text-xs bg-gray-700 text-white px-2 py-0.5 rounded">
                                BETA
                                </span>

                                <input
                                type="text"
                                placeholder="Tell us what would you like to create today?"
                                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                                />

                                <div className="flex justify-between items-center mt-3">
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-400 text-gray-600">
                                    <Plus />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-white">
                                    <MoveRight />
                                </button>
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                            {cards.map((card, index) => (
                                <a href={card.url} className="no-underline">
                                    <div
                                    key={index}
                                    className="bg-white rounded-xl border border-[#99a1af] p-4 hover:shadow-lg transition"
                                    >
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {card.images.map((img, i) => (
                                            <div
                                                key={i}
                                                className="bg-white h-35 overflow-hidden"
                                            >
                                                <img
                                                    src={img}
                                                    alt="Product"
                                                    className="h-auto w-full object-cover"
                                                />
                                            </div>
                                            ))}
                                        </div>

                                        <h3 className="font-semibold text-gray-800 text-md">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {card.desc}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Recent Generations */}
                        <div className="mt-14">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    Recent Generations
                                </h2>
                                <span className="text-xs text-gray-500"><SquareArrowOutUpRight /></span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {recentImages.map((img, i) => (
                                <div
                                    key={i}
                                    className="bg-white border border-[#99a1af] rounded-xl h-auto overflow-hidden">
                                    <img
                                    src={img}
                                    alt=""
                                    className="w-100 h-auto object-cover rounded-lg"
                                    />
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
