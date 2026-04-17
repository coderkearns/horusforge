import Ajv from 'ajv';
import semver from 'semver';
import { CATEGORY_DEFINITIONS, COMPCON_ENUMS } from '../domain/category-definitions.js';

const ajv = new Ajv({ allErrors: true, strict: false });

function schemaFromDefinition(definition) {
    const required = definition.requiredFields ?? [];
    return {
        type: 'object',
        required,
        properties: required.reduce((acc, key) => {
            acc[key] = {};
            return acc;
        }, {}),
        additionalProperties: true
    };
}

const validators = new Map(
    CATEGORY_DEFINITIONS
        .filter((definition) => definition.kind === 'array')
        .map((definition) => [definition.key, ajv.compile(schemaFromDefinition(definition))])
);

const manifestValidator = ajv.compile({
    type: 'object',
    required: ['name', 'author', 'description', 'version'],
    properties: {
        name: { type: 'string' },
        author: { type: 'string' },
        description: { type: 'string' },
        version: { type: 'string' },
        item_prefix: { type: 'string' },
        image_url: { type: 'string' },
        website: { type: 'string' },
        dependencies: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'version'],
                properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    link: { type: 'string' }
                },
                additionalProperties: true
            }
        }
    },
    additionalProperties: true
});

function addIssue(issues, severity, scope, message, path = '') {
    issues.push({ severity, scope, message, path });
}

function validateManifest(project, issues) {
    const valid = manifestValidator(project.manifest);
    if (!valid) {
        for (const error of manifestValidator.errors ?? []) {
            addIssue(issues, 'error', 'manifest', `Manifest ${error.message || 'is invalid'}.`, `manifest${error.instancePath || ''}`);
        }
    }

    if (!semver.valid(project.manifest.version)) {
        addIssue(issues, 'error', 'manifest', 'Manifest version must be a valid semver string (for example 1.0.0).', 'manifest.version');
    }

    const dependencies = project.manifest.dependencies ?? [];
    for (let i = 0; i < dependencies.length; i += 1) {
        const dependency = dependencies[i];
        const version = dependency?.version;
        const isSpecial = typeof version === 'string' && (version === '*' || /^=\d+\.\d+\.\d+$/.test(version));
        if (!isSpecial && !semver.valid(version)) {
            addIssue(issues, 'error', 'manifest', `Dependency ${dependency?.name || i + 1} has invalid version format.`, `manifest.dependencies[${i}].version`);
        }
    }
}

function validateRequiredFields(project, issues) {
    for (const definition of CATEGORY_DEFINITIONS) {
        if (definition.kind !== 'array') {
            continue;
        }

        const entries = project.content[definition.key] ?? [];
        const validator = validators.get(definition.key);
        if (!validator) {
            continue;
        }

        entries.forEach((entry, index) => {
            const valid = validator(entry);
            if (!valid) {
                for (const error of validator.errors ?? []) {
                    addIssue(
                        issues,
                        'error',
                        definition.key,
                        `${definition.singular} ${index + 1}: ${error.message || 'has invalid fields'}.`,
                        `${definition.key}[${index}]${error.instancePath || ''}`
                    );
                }
            }
        });
    }
}

function validateGlobalIds(project, issues) {
    const seen = new Map();

    for (const definition of CATEGORY_DEFINITIONS) {
        if (definition.kind !== 'array') {
            continue;
        }
        const entries = project.content[definition.key] ?? [];

        entries.forEach((entry, index) => {
            if (!entry || typeof entry !== 'object' || !('id' in entry)) {
                return;
            }
            const id = entry.id;
            if (!id || typeof id !== 'string') {
                addIssue(issues, 'error', definition.key, `${definition.singular} ${index + 1} has a missing or invalid id.`, `${definition.key}[${index}].id`);
                return;
            }

            if (seen.has(id)) {
                addIssue(
                    issues,
                    'error',
                    definition.key,
                    `Duplicate id '${id}' also used in ${seen.get(id)}.`,
                    `${definition.key}[${index}].id`
                );
            } else {
                seen.set(id, `${definition.key}`);
            }
        });
    }
}

function validateReferences(project, issues) {
    const manufacturerIds = new Set((project.content.manufacturers ?? []).map((entry) => entry.id).filter(Boolean));
    const frameIds = new Set((project.content.frames ?? []).map((entry) => entry.id).filter(Boolean));

    const sourceCategories = ['core_bonuses', 'frames', 'mods', 'systems', 'weapons'];
    for (const categoryKey of sourceCategories) {
        const entries = project.content[categoryKey] ?? [];
        entries.forEach((entry, index) => {
            if (!entry?.source) {
                return;
            }
            if (!manufacturerIds.has(entry.source)) {
                addIssue(issues, 'error', categoryKey, `Unknown source '${entry.source}' (no matching manufacturer id).`, `${categoryKey}[${index}].source`);
            }
        });
    }

    const licenseCategories = ['mods', 'systems', 'weapons', 'frames'];
    for (const categoryKey of licenseCategories) {
        const entries = project.content[categoryKey] ?? [];
        entries.forEach((entry, index) => {
            if (!entry || !entry.license_id) {
                return;
            }
            if (!frameIds.has(entry.license_id)) {
                addIssue(issues, 'error', categoryKey, `Unknown license_id '${entry.license_id}' (no matching frame id).`, `${categoryKey}[${index}].license_id`);
            }
        });
    }
}

function validateEnumHints(project, issues) {
    (project.content.actions ?? []).forEach((action, index) => {
        if (action?.activation && !COMPCON_ENUMS.activation.includes(action.activation)) {
            addIssue(issues, 'warning', 'actions', `Action activation '${action.activation}' is non-standard.`, `actions[${index}].activation`);
        }
    });

    (project.content.skills ?? []).forEach((skill, index) => {
        if (skill?.family && !COMPCON_ENUMS.skillFamily.includes(skill.family)) {
            addIssue(issues, 'error', 'skills', `Skill family '${skill.family}' must be one of ${COMPCON_ENUMS.skillFamily.join(', ')}.`, `skills[${index}].family`);
        }
    });

    (project.content.statuses ?? []).forEach((status, index) => {
        if (status?.type && !COMPCON_ENUMS.statusType.includes(status.type)) {
            addIssue(issues, 'error', 'statuses', `Status type '${status.type}' must be Status or Condition.`, `statuses[${index}].type`);
        }
    });
}

function validateCompconCompatibility(project, issues) {
    if (project.meta.compatTarget !== 'COMP/CON') {
        addIssue(issues, 'warning', 'project', 'Compatibility target is not COMP/CON.', 'meta.compatTarget');
    }

    if ((project.content.talents ?? []).some((talent) => Array.isArray(talent.ranks) && talent.ranks.length !== 3)) {
        addIssue(issues, 'warning', 'talents', 'Talents with rank counts other than 3 may have edge-case behavior in COMP/CON.', 'talents');
    }
}

export function validateProject(project) {
    const issues = [];

    validateManifest(project, issues);
    validateRequiredFields(project, issues);
    validateGlobalIds(project, issues);
    validateReferences(project, issues);
    validateEnumHints(project, issues);
    validateCompconCompatibility(project, issues);

    const errorCount = issues.filter((entry) => entry.severity === 'error').length;
    const warningCount = issues.filter((entry) => entry.severity === 'warning').length;

    return {
        ok: errorCount === 0,
        issues,
        counts: {
            errors: errorCount,
            warnings: warningCount,
            info: issues.length - errorCount - warningCount
        }
    };
}
