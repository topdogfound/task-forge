import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';


export default function TaskCreate() {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: route('tasks.index')
        },
        {
            title: 'complete',
            href: url
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        number_of_uploads: 1,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('user-tasks.store'), {
            onSuccess: () => {
                setData({ name: '', description: '', number_of_uploads: 1 });
            },
            onError: () => {
                console.log(errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task" />
            <div className="flex flex-col gap-6 max-w-xl mx-auto p-6">
                <h1 className="text-2xl font-bold">Create New Task</h1>
                <p className="text-gray-600">Add a new task for users to complete with file uploads.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="name">Task Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Enter task name"
                            required
                        />
                        {errors.name && <span className="text-red-600 text-sm">{errors.name}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Enter task description"
                            required
                            rows={4}
                        />
                        {errors.description && <span className="text-red-600 text-sm">{errors.description}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="number_of_uploads">Number of Uploads Required</Label>
                        <Input
                            id="number_of_uploads"
                            type="number"
                            min={1}
                            value={data.number_of_uploads}
                            onChange={e => setData('number_of_uploads', Number(e.target.value))}
                            required
                        />
                        {errors.number_of_uploads && (
                            <span className="text-red-600 text-sm">{errors.number_of_uploads}</span>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setData({ name: '', description: '', number_of_uploads: 1 })}
                        >
                            Clear
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
