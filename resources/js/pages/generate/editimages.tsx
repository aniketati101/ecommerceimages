import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Upload, Save, PersonStanding, LoaderCircle } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import DropzoneUploaderTwo from '@/components/DropzoneUploaderTwo';
import { route } from 'ziggy-js';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Images',
        href: '/dashboard/edit',
    },
];



export default function EditImages() {
    
    const [prompt, setPrompt] = useState("Young female model");
    const [selectedValue, setSelectedValue] = useState('');
    const [itemFile, setItemFile] = useState<File | null>(null);
     const [modelFile, setModelFile] = useState<File | null>(null);
    const [promptEnhance, setPromptEnhance] = useState<boolean>(true);
    const [processing, setProcessing] = useState(false);
    
    const handleChange = (value: string) => {
        setSelectedValue(value);
    };
    // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    const handleSubmit = async (e: React.FormEvent) => {
        setProcessing(true);
        e.preventDefault();
        const formData = new FormData();
        if (itemFile) formData.append("itum_file", itemFile);
        if (modelFile) formData.append("model_file", modelFile);
        
        formData.append("prompt", prompt);
        formData.append("promptEnhance", promptEnhance ? "1" : "0");
        formData.append("photos_zoom", selectedValue);
        formData.append("photos_size", selectedValue);
        formData.append("photos", selectedValue);
        await new Promise(resolve => setTimeout(resolve, 2000));

        Inertia.post(route("dashboard.generates.store"), formData, {
        forceFormData: true,
            onSuccess: () => {
                // reset local state
                setItemFile(null);
                setModelFile(null);
                setPrompt("Young female model");
                setSelectedValue("");
                setPromptEnhance(true);
            },
        });
        setProcessing(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex overflow-hidden 100svh">
                <div className="w-[350px] p-6 border-r border-gray-200 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Image</h2>
                    <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Select AI Model</label>
                            <div className="mt-2 border rounded-lg flex items-center justify-between px-3 py-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">SeedDream-4</p>
                                    <p className="text-xs text-gray-500">latest high-resolution model</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">NEW</span>
                            </div>
                        </div>
                        <div className="mt-5 px-5">
                            <DropzoneUploaderTwo label="Click to select a model" onChange={setModelFile} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Prompt</label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full mt-2 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                                placeholder="Young female model"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Image Size</label>
                            <Select name="photos_size" onValueChange={setSelectedValue}>
                                <SelectTrigger className="w-full mt-2 border rounded-lg px-3 py-2 text-sm flex justify-between items-center">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="810x1440px">1K (810x1440 pixels)</SelectItem>
                                    <SelectItem value="1440x2560px">2K (1440x2560 pixels)</SelectItem>
                                    <SelectItem value="944x3456px">4K (1944x3456 pixels)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-teal-500 text-white px-4 py-2 rounded text-sm w-full mt-4 hover:bg-teal-600 cursor-pointer transitio"
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    EDIT IMAGE
                                </>
                            )}
                        </Button>
                    </form>
                </div>
                <div className="flex-1 bg-gray-50 hv-100 flex items-center justify-center">
                    <div className="text-gray-400 flex flex-col items-center">
                        <Upload size={40} />
                        <p className="mt-2 text-sm">Your generated image will appear here</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    ); 
}