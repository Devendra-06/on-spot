'use client';
import { useEffect, useState } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { categoriesService } from '@/app/services/categories.service';
import { Icon } from '@iconify/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const fetchCategories = async () => {
        try {
            const data = await categoriesService.findAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setName('');
        setDescription('');
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (category: any) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        setIsDialogOpen(true);
    };

    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (!name) {
            setError('Name is required');
            return;
        }

        try {
            if (editingCategory) {
                await categoriesService.update(editingCategory.id, { name, description });
                alert('✅ Category updated successfully');
            } else {
                await categoriesService.create({ name, description });
                alert('✅ Category created successfully');
            }
            setIsDialogOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error('Failed to save category', error);
            setError(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await categoriesService.delete(id);
                alert('✅ Category deleted successfully');
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category', error);
                alert('❌ Failed to delete category');
            }
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Categories</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2" onClick={handleOpenCreate}>
                            <Icon icon="solar:add-circle-bold" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Burgers"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input
                                    id="desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Juicy beef burgers"
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                            <Button onClick={handleSubmit}>{editingCategory ? 'Update' : 'Create'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <CardBox>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(category)}>
                                            <Icon icon="solar:pen-bold" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(category.id)}>
                                            <Icon icon="solar:trash-bin-trash-bold" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardBox>
        </div>
    );
}
