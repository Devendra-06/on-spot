'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';

const MOCK_TASKS = [
    { id: 1, title: 'Review New Menu Items', priority: 'High', status: 'Pending', date: '2026-01-29' },
    { id: 2, title: 'Approve Restaurant Registration', priority: 'Medium', status: 'In Progress', date: '2026-01-29' },
    { id: 3, title: 'System Security Audit', priority: 'Critical', status: 'Completed', date: '2026-01-28' },
];

export default function TasksPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Tasks</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {MOCK_TASKS.length} Total Tasks
                </Badge>
            </div>

            <div className="grid gap-4">
                {MOCK_TASKS.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Icon icon={task.status === 'Completed' ? "solar:check-circle-bold" : "solar:clock-circle-linear"} width={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="solar:calendar-linear" width={14} />
                                            {task.date}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                task.priority === 'Critical' ? 'bg-red-50 text-red-600 hover:bg-red-50' :
                                                    task.priority === 'High' ? 'bg-orange-50 text-orange-600 hover:bg-orange-50' : 'bg-blue-50 text-blue-600 hover:bg-blue-50'
                                            }
                                        >
                                            {task.priority} Priority
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Badge variant={task.status === 'Completed' ? "default" : "outline"}>
                                    {task.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-lightprimary/20 border-lightprimary">
                <CardContent className="p-6 text-center space-y-2">
                    <Icon icon="solar:info-circle-linear" className="mx-auto text-primary" width={32} />
                    <h4 className="font-semibold text-primary">Need more help?</h4>
                    <p className="text-sm text-gray-600">Tasks are automatically assigned based on your role and system triggers.</p>
                </CardContent>
            </Card>
        </div>
    );
}
