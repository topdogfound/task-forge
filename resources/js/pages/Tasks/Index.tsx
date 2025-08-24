import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { CompleteTaskModal } from '@/components/complete-task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Task interface
interface Task {
  id: number;
  name: string;
  description: string;
  number_of_uploads: number;
  manager_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_task_id: number | null;
  permissions: {
    can_start: boolean;
    can_complete: boolean;
    can_create: boolean;
  };
  in_progress: boolean;
  current_user_role: string | null;
}

interface LaravelPaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

interface LaravelPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: LaravelPaginationLinks[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

interface TasksCollection {
  data: Task[];
  current_user_role: string | null;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: LaravelPaginationMeta;
}

interface TasksProps {
  tasks: TasksCollection;
  [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tasks', href: route('tasks.index') }];

export default function Tasks() {
  const { tasks } = usePage<TasksProps>().props;

  const handlePageChange = (url: string) => {
    if (url) {
      router.get(url, {}, { preserveScroll: true, preserveState: true });
    }
  };

  const renderPaginationItems = () => {
    const { meta } = tasks;
    const items: JSX.Element[] = [];

    meta.links.forEach((link, index) => {
      if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') return;

      if (link.label === '...') {
        items.push(
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
        return;
      }

      if (link.url) {
        items.push(
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(link.url!);
              }}
              className={link.active ? 'bg-primary text-primary-foreground' : ''}
            >
              {link.label}
            </PaginationLink>
          </PaginationItem>
        );
      }
    });

    return items;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tasks" />
      <div className="p-4 flex flex-col gap-6">
        {tasks.data.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Task Management</h1>
              {tasks.current_user_role === 'manager' && (
                <Link href={route('tasks.create')}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create New Task
                  </Button>
                </Link>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.data.map((task: Task) => (
                <Card key={task.id} className="shadow-md hover:shadow-lg transition rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{task.name}</span>
                      {task.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                        {task.number_of_uploads} Uploads
                      </span>

                      {task.in_progress && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                          In Progress
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 justify-end">
                      {task.permissions.can_start && !task.in_progress && (
                        <Link href={route('tasks.start', task.id)}>
                          <Button size="sm" className="flex-1">Start</Button>
                        </Link>
                      )}
                      {task.permissions.can_complete && <CompleteTaskModal task={task} />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {tasks.meta.last_page > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (tasks.links.prev) handlePageChange(tasks.links.prev);
                        }}
                        className={!tasks.links.prev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (tasks.links.next) handlePageChange(tasks.links.next);
                        }}
                        className={!tasks.links.next ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks created yet</h3>
            <p className="text-gray-500 mb-6">Create your first task to get started with task management</p>
            <Link href={route('tasks.create')}>
              <Button className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Task
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
