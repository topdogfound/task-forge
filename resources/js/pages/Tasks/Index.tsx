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
    user_task_id:number | null;
    permissions: {
        can_start: boolean;
        can_complete: boolean;
        can_create: boolean;
    };
    in_progress: boolean;
    current_user_role: string | null;
}

// Pagination link interface
interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

// Laravel pagination response structure
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

// Inertia resource collection with pagination
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

// Page props interface
interface TasksProps {
    tasks: TasksCollection;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tasks', href: route('tasks.index') },
];

export default function Tasks() {
    const { tasks } = usePage<TasksProps>().props;
    console.log(tasks);

    // Handle pagination navigation
    const handlePageChange = (url: string) => {
        if (url) {
            router.get(url, {}, { preserveScroll: true, preserveState: true });
        }
    };

    // Render pagination numbers with ellipsis handling
    const renderPaginationItems = () => {
        const { meta } = tasks;
        const items: JSX.Element[] = [];

        meta.links.forEach((link, index) => {
            // Skip previous and next arrows (they're handled separately)
            if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') {
                return;
            }

            // Handle ellipsis
            if (link.label === '...') {
                items.push(
                    <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
                return;
            }

            // Regular page links
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
                        <div className="space-y-4">
                            {/* Results summary */}
                            {/* <div className="text-sm text-gray-600">
                            Showing {tasks.meta.from} to {tasks.meta.to} of {tasks.meta.total} results
                        </div> */}

                            {/* Table */}
                            <div className="overflow-x-auto rounded-lg shadow-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Uploads
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tasks.data.map((task: Task) => (
                                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    {task.name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="max-w-xs truncate" title={task.description}>
                                                        {task.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {task.number_of_uploads}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {task.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="flex px-6 py-4 text-center justify-center space-x-2">
                                                    {task.in_progress ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            In Progress
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {task.permissions.can_start && (
                                                                <Link href={route('tasks.start', task.id)}>
                                                                    <Button className="flex items-center gap-2">
                                                                        Start
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                            {task.permissions.can_complete && (
                                                                <CompleteTaskModal task={task} />
                                                            )}

                                                        </>
                                                    )}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {tasks.meta.last_page > 1 && (
                                <div className="flex justify-center mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            {/* Previous button */}
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (tasks.links.prev) {
                                                            handlePageChange(tasks.links.prev);
                                                        }
                                                    }}
                                                    className={
                                                        !tasks.links.prev
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer'
                                                    }
                                                />
                                            </PaginationItem>

                                            {/* Page numbers */}
                                            {renderPaginationItems()}

                                            {/* Next button */}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (tasks.links.next) {
                                                            handlePageChange(tasks.links.next);
                                                        }
                                                    }}
                                                    className={
                                                        !tasks.links.next
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer'
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}


                        </div>
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