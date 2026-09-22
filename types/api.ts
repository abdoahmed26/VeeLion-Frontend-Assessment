export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  taskId?: string;
  action?: string;
  info?: string;
  when: string;
};

export type TasksResponse = {
  data: Task[];
};

export type TaskResponse = {
  data: Task;
};

export type ErrorResponse = {
  error?: {
    message?: string;
  };
};

export type TaskFilter = 'all' | TaskStatus;

export type TaskChanges = { title?: string; status?: TaskStatus; completed?: boolean };

export type TasksSummary = {
  total: number;
  byStatus: { todo: number; 'in-progress': number; done: number };
  recentActivityCount: number;
};
