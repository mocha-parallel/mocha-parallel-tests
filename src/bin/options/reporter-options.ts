import { ICLIReporterOptions } from '../../interfaces';

export default function applyReporterOptions(reporterOptions: string[]) {
  const output: ICLIReporterOptions = {};

  for (const reporterOption of reporterOptions) {
    reporterOption.split(',').forEach((opt) => {
      const L = opt.split('=');

      if (L.length > 2 || L.length === 0) {
        throw new Error(`Invalid reporter option "${opt}"`);
      }

      if (L.length === 2) {
        output[L[0]] = L[1];
      } else {
        output[L[0]] = true;
      }
    });
  }

  return output;
}
