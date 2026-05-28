import { Description } from "@radix-ui/react-dialog";
import { icons } from "lucide-react";

export const categoryModalFormConfig= {
    moduleTitle: 'Manage Categories',
    title: 'Create Category',
    Description: 'Create a new category',
    addButton:{
        id: 'add-category-button',
        label: 'Add Category',
        className: 'bg-teal-500 text-white px-4 py-2 rounded',
        icons: 'plus',
        type: 'button',
        varient: 'default',
    },
    fields: [
        {
            id: 'category-name',
            name: 'name',
            label: 'Category Name',
            type: 'text',
            placeholder: 'Enter category name',
            autocomplete: 'name',
            tabIndex: 1,
            autoFocus: true,
        },
        {
            id: 'category-description',
            name: 'description',
            label: 'Category Description',
            type: 'textarea',
            placeholder: 'Enter category Description',
            autocomplete: 'description',
            tabIndex: 2,
            rows: 3,
        },
        {
            id: 'category-image',
            name: 'image',
            label: 'Image (Optional)',
            type: 'file',
            placeholder: 'Upload category Image',
            accept: 'image/*',
            tabIndex: 3,
        }
    ]
}