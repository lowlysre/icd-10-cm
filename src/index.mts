import { getICD10Description } from "./index.cjs";

export {
  getICD10Description,
  ensureICD10DatasetLoaded,
  normalizeICD10Code,
  ICD10_CM_RELEASE,
} from "./index.cjs";
export type { ICD10Dictionary, ICD10CMRelease } from "./index.cjs";

export default getICD10Description;
