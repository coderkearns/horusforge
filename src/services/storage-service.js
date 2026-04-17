import { STORAGE_KEY, createEmptyProject } from '../state/default-state.js';

function parseStoredPayload(raw) {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function loadAutosave() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }
    const parsed = parseStoredPayload(raw);
    if (!parsed || typeof parsed !== 'object') {
        return null;
    }
    return parsed;
}

export function saveAutosave(project) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function clearAutosave() {
    localStorage.removeItem(STORAGE_KEY);
}

export function restoreOrCreateProject() {
    return loadAutosave() ?? createEmptyProject();
}
