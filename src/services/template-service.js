import { CATEGORY_DEFINITIONS } from '../domain/category-definitions.js';
import { createEmptyProject } from '../state/default-state.js';
import { createSuggestedId, ensureUniqueId } from './id-service.js';

function applyPrefixToId(prefix, value) {
    if (!value || typeof value !== 'string') {
        return value;
    }
    if (value.startsWith(`${prefix}_`)) {
        return value;
    }
    return createSuggestedId(prefix, value, value);
}

function createStarterItem(definition, prefix, existingIds = new Set()) {
    const base = structuredClone(definition.defaults);
    if (Object.prototype.hasOwnProperty.call(base, 'id')) {
        const prefixed = applyPrefixToId(prefix, base.id);
        base.id = ensureUniqueId(existingIds, prefixed);
        existingIds.add(base.id);
    }
    if (Object.prototype.hasOwnProperty.call(base, 'license_id')) {
        base.license_id = applyPrefixToId(prefix, base.license_id);
    }
    if (Object.prototype.hasOwnProperty.call(base, 'source')) {
        base.source = prefix.toUpperCase().slice(0, 3);
    }
    return base;
}

function withMeta(project, title, prefix) {
    project.meta.title = title;
    project.manifest.name = title;
    project.manifest.item_prefix = `${prefix}_`;
    project.manifest.author = '';
    project.meta.updatedAt = new Date().toISOString();
    return project;
}

function seedCategory(project, categoryKey, prefix, count = 1) {
    const definition = CATEGORY_DEFINITIONS.find((entry) => entry.key === categoryKey);
    if (!definition) {
        return;
    }
    if (definition.kind === 'array') {
        const existingIds = new Set(
            project.content[categoryKey]
                .map((item) => item?.id)
                .filter((id) => typeof id === 'string' && id.length > 0)
        );
        for (let i = 0; i < count; i += 1) {
            project.content[categoryKey].push(createStarterItem(definition, prefix, existingIds));
        }
    } else {
        project.content[categoryKey] = structuredClone(definition.defaults);
    }
}

function addBaseManufacturer(project, prefix) {
    const manufacturer = project.content.manufacturers[0];
    if (!manufacturer) {
        seedCategory(project, 'manufacturers', prefix, 1);
    }
    const item = project.content.manufacturers[0];
    item.id = prefix.toUpperCase().slice(0, 3);
    item.name = `${prefix.toUpperCase()} Collective`;
}

export const TEMPLATE_OPTIONS = [
    { id: 'blank', name: 'Blank Pack', description: 'Start empty with only manifest metadata.' },
    { id: 'manufacturer', name: 'New Manufacturer Pack', description: 'Manufacturer plus frame, systems, weapons, and tags.' },
    { id: 'frame_license', name: 'New Frame License', description: 'A frame-centered starter with systems and weapons.' },
    { id: 'weapon_line', name: 'New Weapon Line', description: 'Seed multiple weapons with related tags/mods.' },
    { id: 'talent_pack', name: 'New Talent Pack', description: 'Talents, pilot gear, and reserve support.' },
    { id: 'full_scaffold', name: 'Full Scaffold', description: 'One starter entry in all supported files.' }
];

export function createProjectFromTemplate(templateId, packTitle = 'Untitled HORUS Pack', prefix = 'hf') {
    const project = createEmptyProject();
    withMeta(project, packTitle, prefix);

    switch (templateId) {
        case 'blank': {
            break;
        }
        case 'manufacturer': {
            seedCategory(project, 'manufacturers', prefix);
            addBaseManufacturer(project, prefix);
            seedCategory(project, 'frames', prefix);
            seedCategory(project, 'systems', prefix, 2);
            seedCategory(project, 'weapons', prefix, 2);
            seedCategory(project, 'tags', prefix, 2);
            break;
        }
        case 'frame_license': {
            seedCategory(project, 'manufacturers', prefix);
            addBaseManufacturer(project, prefix);
            seedCategory(project, 'frames', prefix);
            seedCategory(project, 'systems', prefix, 3);
            seedCategory(project, 'weapons', prefix, 3);
            seedCategory(project, 'mods', prefix, 1);
            break;
        }
        case 'weapon_line': {
            seedCategory(project, 'manufacturers', prefix);
            addBaseManufacturer(project, prefix);
            seedCategory(project, 'weapons', prefix, 4);
            seedCategory(project, 'mods', prefix, 2);
            seedCategory(project, 'tags', prefix, 2);
            break;
        }
        case 'talent_pack': {
            seedCategory(project, 'talents', prefix, 2);
            seedCategory(project, 'pilot_gear', prefix, 3);
            seedCategory(project, 'reserves', prefix, 2);
            seedCategory(project, 'skills', prefix, 2);
            break;
        }
        case 'full_scaffold': {
            for (const definition of CATEGORY_DEFINITIONS) {
                seedCategory(project, definition.key, prefix, 1);
            }
            addBaseManufacturer(project, prefix);
            break;
        }
        default: {
            break;
        }
    }

    project.meta.updatedAt = new Date().toISOString();
    return project;
}
