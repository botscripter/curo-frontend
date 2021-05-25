import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskComponent } from './task/task.component';

const routes: Routes = [
  {
    path: '',
    component: TaskListComponent
  },
  {
    path: 'list/:filterId',
    component: TaskListComponent
  },
  {
    path: ':taskId',
    component: TaskComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
