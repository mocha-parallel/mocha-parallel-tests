// monkeypatch Node.JS native TTY function
// otherwise mocha native base reporter throws exception
// inside a worker environment
require('tty').getWindowSize = () => 75;

import { workerData } from 'worker_threads';
import { runMocha } from '../runner';
import { WorkerData } from '../../main/thread/worker';

const { file, options } = workerData as WorkerData;
runMocha(file, options, false);
