import JSZip from 'jszip';
import { CATEGORY_DEFINITIONS } from '../domain/category-definitions.js';
import { createEmptyProject } from '../state/default-state.js';

const FILE_MAP = new Map(CATEGORY_DEFINITIONS.map((entry) => [entry.fileName, entry]));

function looksLikeJsonFile(path) {
    return path.toLowerCase().endsWith('.json');
}

function normalizeToFileName(path) {
    const segments = path.split('/').filter(Boolean);
    return segments.at(-1);
}

function parseJsonOrThrow(text, fileName) {
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Failed to parse JSON in ${fileName}.`);
    }
}

function applyImportedFile(project, fileName, value) {
    if (fileName === 'lcp_manifest.json') {
        project.manifest = {
            ...project.manifest,
            ...value,
            dependencies: Array.isArray(value.dependencies) ? value.dependencies : []
        };
        project.meta.title = value.name || project.meta.title;
        return;
    }

    const definition = FILE_MAP.get(fileName);
    if (!definition) {
        return;
    }

    if (definition.kind === 'array') {
        project.content[definition.key] = Array.isArray(value) ? value : [];
        return;
    }

    project.content[definition.key] = value && typeof value === 'object' ? value : structuredClone(definition.defaults);
}

export async function parseLcpArchiveFromArrayBuffer(arrayBuffer, sourceLabel = 'archive') {
    const project = createEmptyProject();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const files = Object.values(zip.files).filter((entry) => !entry.dir && looksLikeJsonFile(entry.name));

    if (files.length === 0) {
        throw new Error(`No JSON files found in ${sourceLabel}.`);
    }

    for (const file of files) {
        const normalized = normalizeToFileName(file.name);
        if (!normalized) {
            continue;
        }
        const text = await file.async('string');
        const parsed = parseJsonOrThrow(text, normalized);
        applyImportedFile(project, normalized, parsed);
    }

    project.meta.updatedAt = new Date().toISOString();
    return project;
}

export async function parseLcpFile(file) {
    const buffer = await file.arrayBuffer();
    return parseLcpArchiveFromArrayBuffer(buffer, file.name);
}

function hasContent(value, definition) {
    if (definition.kind === 'array') {
        return Array.isArray(value) && value.length > 0;
    }
    return value && typeof value === 'object' && Object.values(value).some((entry) => {
        if (Array.isArray(entry)) {
            return entry.length > 0;
        }
        return Boolean(entry);
    });
}

export async function buildLcpBlob(project) {
    const zip = new JSZip();
    zip.file('lcp_manifest.json', JSON.stringify(project.manifest, null, 2));

    for (const definition of CATEGORY_DEFINITIONS) {
        const value = project.content[definition.key];
        if (!hasContent(value, definition)) {
            continue;
        }
        zip.file(definition.fileName, JSON.stringify(value, null, 2));
    }

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    return blob;
}

export function createDownloadName(project) {
    const name = (project.manifest.name || 'horusforge-pack').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const version = (project.manifest.version || '0.0.0').trim();
    return `${name || 'horusforge-pack'}-${version}.lcp`;
}
