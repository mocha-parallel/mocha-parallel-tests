import { workerData } from 'worker_threads';

import { runMocha } from './runner';
import { WorkerData } from '../main/thread/worker';

const { file, options } = workerData as WorkerData;
runMocha(file, options, false);
