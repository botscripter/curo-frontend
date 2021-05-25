import { Task } from './task';

export interface TaskList {
  name?: string;
  description?: string;
  refresh?: boolean;
  properties?: any;
  total: number;
  items: Task[];
}
