import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Tasks',
    href: route('tasks.index'),
  },
  {
    title: 'Create',
    href: route('tasks.create'),
  },
];


export default function Create() {

    const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // your handleSubmit logic here...
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Task Create" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <Card className="max-w-md mx-auto mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Task
            </CardTitle>
            <CardDescription>Add a new task for users to complete with file uploads.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input id="name" name="name" placeholder="Enter task name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Enter task description" required rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfUploads">Number of Uploads Required</Label>
                <Input
                  id="numberOfUploads"
                  name="numberOfUploads"
                  type="number"
                  min="1"
                  placeholder="Enter number of uploads"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { /* maybe reset form */ }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
