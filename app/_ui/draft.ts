import { DRAFT_KEY } from "./storage-keys";
import { stored } from "./stored";

/** The draft, so a reload does not lose it. */
const draft = stored<string>({ key: DRAFT_KEY, fallback: "", parse: (raw) => raw });

export const saveDraft = draft.set;
export const useDraft = draft.use;
