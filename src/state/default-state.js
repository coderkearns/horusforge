import { CATEGORY_DEFINITIONS } from '../domain/category-definitions.js';

export const STORAGE_KEY = 'horusforge.autosave.v1';

export function emptyManifest() {
    return {
        name: 'New HORUS Pack',
        author: '',
        description: 'A custom LANCER content pack created in HORUSForge.',
        version: '1.0.0',
        item_prefix: 'hf_',
        image_url: '',
        website: '',
        dependencies: []
    };
}

export function emptyContent() {
    const content = {};
    for (const definition of CATEGORY_DEFINITIONS) {
        content[definition.key] = definition.kind === 'array' ? [] : structuredClone(definition.defaults);
    }
    return content;
}

export function createEmptyProject() {
    return {
        meta: {
            title: 'Untitled HORUS Pack',
            compatTarget: 'COMP/CON',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        manifest: emptyManifest(),
        content: emptyContent(),
        settings: {
            advancedMode: false,
            effectsEnabled: true,
            reducedMotion: false,
            autoValidate: true
        }
    };
}

export function cloneProject(project) {
    return JSON.parse(JSON.stringify(project));
}
