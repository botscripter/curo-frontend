import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '@umb-ag/curo-core';
import { Observable, of, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  switchMap,
  take,
  withLatestFrom
} from 'rxjs/operators';

@Component({
  selector: 'app-create-suggestion',
  templateUrl: './create-suggestion.component.html',
  styleUrls: ['./create-suggestion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSuggestionComponent implements OnInit, OnDestroy {
  form: FormGroup;
  comments?: string;
  taskId$: Observable<string>;

  private valueChangesSubscription?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private matSnackBar: MatSnackBar,
    fb: FormBuilder
  ) {
    this.taskId$ = this.activatedRoute.params.pipe(
      map((params) => params.taskId)
    );

    this.form = fb.group({
      title: [null, Validators.required],
      category: [],
      description: [null, Validators.required],
      url: []
    });
  }

  ngOnInit(): void {
    this.taskId$
      .pipe(
        switchMap((taskId) =>
          this.taskService.getTask(taskId, {
            attributes: ['variables']
          })
        ),
        map((task) => task.variables),
        take(1)
      )
      .subscribe(
        (variables: any) => {
          this.form.patchValue(variables);
          this.registerValueChanges();
          this.comments = variables.comments;
        },
        () => {
          this.registerValueChanges();
          this.matSnackBar.open('Variables could not be loaded', 'Done', {
            duration: 2000
          });
          this.comments = undefined;
        }
      );
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  registerValueChanges(): void {
    this.valueChangesSubscription = this.form.valueChanges
      .pipe(
        debounceTime(1000),
        withLatestFrom(this.taskId$),
        switchMap(([variables, taskId]) =>
          this.taskService
            .saveVariables(taskId, variables)
            .pipe(catchError((error) => of(error)))
        )
      )
      .subscribe((data) => {
        if (data?.error) {
          this.matSnackBar.open('Variables could not be saved', 'Done', {
            duration: 2000
          });
        } else {
          this.matSnackBar.open('Variables saved successfully', 'Done', {
            duration: 2000
          });
        }
      });
  }

  assign(): void {
    this.taskId$
      .pipe(
        take(1),
        switchMap((taskId) =>
          this.taskService
            .assignTask(taskId, 'demo')
            .pipe(catchError((error) => of(error)))
        )
      )
      .subscribe((data) => {
        if (data?.error) {
          this.matSnackBar.open('Task could not be assigned', 'Done', {
            duration: 2000
          });
        } else {
          this.matSnackBar.open('Task assigned successfully', 'Done', {
            duration: 2000
          });
        }
      });
  }

  complete(): void {
    if (this.form.valid) {
      this.taskId$
        .pipe(
          take(1),
          switchMap((taskId) =>
            this.taskService.completeTask(taskId, this.form.value, {
              flowToNext: true,
              flowToNextIgnoreAssignee: true
            })
          )
        )
        .subscribe((task) => {
          this.router.navigate(
            ['..', task.flowToNext ? task.flowToNext[0] : ''],
            {
              relativeTo: this.activatedRoute
            }
          );
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
