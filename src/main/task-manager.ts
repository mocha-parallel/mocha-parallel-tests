import assert from 'assert';
import { EventEmitter } from 'events';
import { cpus } from 'os';

export type Task<T> = () => Promise<T>;
export interface TaskOutput<T> {
  task: Task<T>;
  output?: T;
}


export default class TaskManager<TaskResult> extends EventEmitter {
  private maxParallel: number;
  private tasks: TaskOutput<TaskResult>[] = [];
  private remainingTasks = new Set<Task<TaskResult>>();
  private processingTasks = new Set<Task<TaskResult>>();

  constructor(maxParallel: number = cpus().length) {
    super();

    this.maxParallel = maxParallel || Number.POSITIVE_INFINITY;
    this.on('processingFinished', this.onTaskProcessingFinished);
  }

  add(task: Task<TaskResult>): void {
    this.tasks.push({ task });
    this.remainingTasks.add(task);
  }

  execute() {
    for (const task of this.remainingTasks) {
      this.startTaskProcessing(task);

      if (this.processingTasks.size >= this.maxParallel) {
        break;
      }
    }
  }

  private onTaskProcessingFinished = (finishedTask: Task<TaskResult>, output: TaskResult) => {
    assert(!this.remainingTasks.has(finishedTask), 'Unknown task, cannot finalize it');
    assert(this.processingTasks.has(finishedTask), 'Task has not been started processing');

    const taskIndex = this.tasks.findIndex(({ task }) => task === finishedTask);
    assert(taskIndex !== -1, 'Unknown task, cannot write its output');

    this.tasks[taskIndex].output = output;
    this.processingTasks.delete(finishedTask);

    this.emit('taskFinished', output);

    this.execute();
    this.emitEndIfAllFinished();
  }

  private async startTaskProcessing(task: Task<TaskResult>) {
    assert(this.remainingTasks.has(task), 'Unknown task, cannot process it');
    assert(!this.processingTasks.has(task), 'Task has already started processing');

    this.remainingTasks.delete(task);
    this.processingTasks.add(task);

    const res = await task();
    this.emit('processingFinished', task, res);
  }

  private emitEndIfAllFinished() {
    const shouldEmit = this.tasks.every(({ output }) => output !== undefined);

    if (shouldEmit) {
      this.emit('end');
    }
  }
}
