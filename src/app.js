import { CATEGORY_DEFINITIONS, FIELD_TOOLTIPS, getCategoryDefinition } from './domain/category-definitions.js';
import { BOOT_LINES, ASCII_FRAGMENT, OMNINET_BOOT_SCRIPT } from './assets/ascii-fragments.js';
import { cloneProject, createEmptyProject } from './state/default-state.js';
import { clearAutosave, restoreOrCreateProject, saveAutosave } from './services/storage-service.js';
import { TEMPLATE_OPTIONS, createProjectFromTemplate } from './services/template-service.js';
import { createDownloadName, buildLcpBlob, parseLcpFile } from './services/lcp-archive-service.js';
import { importLcpFromUrl } from './services/url-import-service.js';
import { validateProject } from './services/validation-service.js';

function isLikelyJson(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const trimmed = value.trim();
    return trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed === '';
}

function stringForField(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

function parseFieldInput(raw, existingValue) {
    if (Array.isArray(existingValue) || (existingValue && typeof existingValue === 'object')) {
        const trimmed = raw.trim();
        if (!trimmed) {
            return Array.isArray(existingValue) ? [] : {};
        }
        return JSON.parse(trimmed);
    }

    if (typeof existingValue === 'boolean') {
        return raw === 'true';
    }

    if (typeof existingValue === 'number') {
        const parsed = Number(raw);
        return Number.isNaN(parsed) ? existingValue : parsed;
    }

    if (raw === 'true') {
        return true;
    }
    if (raw === 'false') {
        return false;
    }
    if (raw !== '' && /^-?\d+(\.\d+)?$/.test(raw)) {
        return Number(raw);
    }

    return raw;
}

export function horusforgeApp() {
    return {
        bootLines: BOOT_LINES,
        asciiFragment: ASCII_FRAGMENT,
        omninetBootScript: OMNINET_BOOT_SCRIPT,
        templates: TEMPLATE_OPTIONS,
        categories: CATEGORY_DEFINITIONS,
        fieldTooltips: FIELD_TOOLTIPS,
        project: createEmptyProject(),
        selectedCategory: 'manufacturers',
        selectedItemIndex: 0,
        selectedTemplate: 'blank',
        newPackName: 'Untitled HORUS Pack',
        newPackPrefix: 'hf',
        activeField: '',
        rawEditor: '',
        manifestRaw: '',
        statusMessage: '',
        statusLevel: 'info',
        validation: { ok: true, issues: [], counts: { errors: 0, warnings: 0, info: 0 } },
        urlImportInput: '',
        saveDebounceTimer: null,
        bootFeed: [],
        bootFeedTimer: null,
        bootCompleted: false,
        categoryFilter: '',
        lastAutosaveAt: '',

        init() {
            this.project = restoreOrCreateProject();
            this.newPackName = this.project.meta.title || this.newPackName;
            this.newPackPrefix = (this.project.manifest.item_prefix || 'hf_').replace(/_$/, '');
            this.refreshEditors();
            this.runValidation();
            this.startBootSequence();
            this.$changeScreen('boot');
        },

        startBootSequence() {
            this.bootFeed = [];
            this.bootCompleted = false;
            clearInterval(this.bootFeedTimer);

            const mergedBootLines = [
                ...this.bootLines,
                '',
                '$ initiator boot vector...',
                ...this.asciiFragment,
                '',
                ...this.omninetBootScript
            ];

            let idx = 0;
            this.bootFeedTimer = setInterval(() => {
                this.bootFeed.push(mergedBootLines[idx]);
                idx += 1;

                if (idx >= mergedBootLines.length) {
                    clearInterval(this.bootFeedTimer);
                    this.bootCompleted = true;
                }
            }, this.project.settings?.reducedMotion ? 150 : 360);
        },

        proceedFromBoot() {
            if (!this.bootCompleted) {
                return;
            }
            this.$changeScreen('project');
        },

        skipBootSequence() {
            clearInterval(this.bootFeedTimer);
            this.bootFeed = [
                ...this.bootLines,
                '',
                '$ initiator boot vector...',
                ...this.asciiFragment,
                '',
                ...this.omninetBootScript
            ];
            this.bootCompleted = true;
            this.$changeScreen('project');
        },

        bootBlobText() {
            return this.bootFeed.join('\n');
        },

        categoryDef() {
            return getCategoryDefinition(this.selectedCategory);
        },

        categoryEntries() {
            const definition = this.categoryDef();
            if (!definition) {
                return [];
            }
            if (definition.kind === 'array') {
                return this.project.content[this.selectedCategory] ?? [];
            }
            return [this.project.content[this.selectedCategory] ?? {}];
        },

        currentItem() {
            const definition = this.categoryDef();
            if (!definition) {
                return null;
            }
            if (definition.kind === 'array') {
                const entries = this.project.content[this.selectedCategory] ?? [];
                return entries[this.selectedItemIndex] ?? null;
            }
            return this.project.content[this.selectedCategory] ?? null;
        },

        selectCategory(categoryKey) {
            this.selectedCategory = categoryKey;
            this.selectedItemIndex = 0;
            this.activeField = '';
            this.refreshEditors();
        },

        selectItem(index) {
            this.selectedItemIndex = index;
            this.activeField = '';
            this.refreshEditors();
        },

        createNewProject() {
            this.project = createProjectFromTemplate(this.selectedTemplate, this.newPackName, this.newPackPrefix || 'hf');
            this.selectedCategory = 'manufacturers';
            this.selectedItemIndex = 0;
            this.refreshEditors();
            this.markDirty('New project created from template.');
            this.$changeScreen('editor');
        },

        loadAutosaveProject() {
            this.project = restoreOrCreateProject();
            this.refreshEditors();
            this.runValidation();
            this.status('Loaded autosaved project.', 'info');
            this.$changeScreen('editor');
        },

        resetToEmptyProject() {
            this.project = createEmptyProject();
            this.refreshEditors();
            this.markDirty('Project reset.');
        },

        clearAutosavedState() {
            clearAutosave();
            this.status('Autosave cleared from local storage.', 'warning');
        },

        addItem() {
            const definition = this.categoryDef();
            if (!definition || definition.kind !== 'array') {
                return;
            }
            const starter = structuredClone(definition.defaults);
            this.project.content[this.selectedCategory].push(starter);
            this.selectedItemIndex = this.project.content[this.selectedCategory].length - 1;
            this.refreshEditors();
            this.markDirty(`${definition.singular} added.`);
        },

        duplicateCurrentItem() {
            const definition = this.categoryDef();
            if (!definition || definition.kind !== 'array') {
                return;
            }
            const current = this.currentItem();
            if (!current) {
                return;
            }
            const cloned = JSON.parse(JSON.stringify(current));
            if (typeof cloned.id === 'string') {
                cloned.id = `${cloned.id}_copy`;
            }
            if (typeof cloned.name === 'string') {
                cloned.name = `${cloned.name} Copy`;
            }
            this.project.content[this.selectedCategory].push(cloned);
            this.selectedItemIndex = this.project.content[this.selectedCategory].length - 1;
            this.refreshEditors();
            this.markDirty(`${definition.singular} duplicated.`);
        },

        removeCurrentItem() {
            const definition = this.categoryDef();
            if (!definition || definition.kind !== 'array') {
                return;
            }
            const entries = this.project.content[this.selectedCategory];
            if (!entries.length) {
                return;
            }
            entries.splice(this.selectedItemIndex, 1);
            this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
            this.refreshEditors();
            this.markDirty(`${definition.singular} removed.`);
        },

        updateField(fieldName, inputValue) {
            const item = this.currentItem();
            if (!item) {
                return;
            }
            try {
                item[fieldName] = parseFieldInput(inputValue, item[fieldName]);
                this.refreshEditors();
                this.markDirty();
            } catch {
                this.status(`Invalid JSON for ${fieldName}.`, 'error');
            }
        },

        setActiveField(fieldName) {
            this.activeField = fieldName;
        },

        tooltipFor(fieldName) {
            return this.fieldTooltips[fieldName] || 'No tooltip available for this field.';
        },

        fieldValue(fieldName) {
            const item = this.currentItem();
            if (!item) {
                return '';
            }
            return stringForField(item[fieldName]);
        },

        isJsonField(fieldName) {
            const item = this.currentItem();
            if (!item) {
                return false;
            }
            const value = item[fieldName];
            return Array.isArray(value) || (value && typeof value === 'object');
        },

        beginnerFields() {
            const definition = this.categoryDef();
            return definition?.beginnerFields ?? [];
        },

        applyRawEditor() {
            const definition = this.categoryDef();
            if (!definition) {
                return;
            }

            try {
                const parsed = JSON.parse(this.rawEditor || '{}');
                if (definition.kind === 'array') {
                    this.project.content[this.selectedCategory][this.selectedItemIndex] = parsed;
                } else {
                    this.project.content[this.selectedCategory] = parsed;
                }
                this.markDirty('Raw editor changes applied.');
                this.refreshEditors();
            } catch {
                this.status('Raw JSON is invalid.', 'error');
            }
        },

        applyManifestRaw() {
            try {
                const parsed = JSON.parse(this.manifestRaw || '{}');
                this.project.manifest = parsed;
                this.markDirty('Manifest updated.');
            } catch {
                this.status('Manifest JSON is invalid.', 'error');
            }
        },

        refreshEditors() {
            this.rawEditor = JSON.stringify(this.currentItem() ?? {}, null, 2);
            this.manifestRaw = JSON.stringify(this.project.manifest ?? {}, null, 2);
        },

        async importLocalLcp(event) {
            const [file] = event.target.files || [];
            if (!file) {
                return;
            }

            try {
                this.project = await parseLcpFile(file);
                this.selectedCategory = 'manufacturers';
                this.selectedItemIndex = 0;
                this.refreshEditors();
                this.markDirty(`Imported ${file.name}.`);
                this.$changeScreen('editor');
            } catch (error) {
                this.status(error.message || 'Could not import file.', 'error');
            } finally {
                event.target.value = '';
            }
        },

        async importFromUrl() {
            if (!this.urlImportInput.trim()) {
                this.status('Paste a URL first.', 'warning');
                return;
            }
            try {
                this.project = await importLcpFromUrl(this.urlImportInput.trim());
                this.selectedCategory = 'manufacturers';
                this.selectedItemIndex = 0;
                this.refreshEditors();
                this.markDirty('Imported LCP from URL.');
                this.$changeScreen('editor');
            } catch (error) {
                this.status(`${error.message || 'URL import failed.'} If this is CORS-related, download the file and import locally.`, 'error');
            }
        },

        async exportLcp() {
            this.runValidation();
            if (!this.validation.ok) {
                this.status('Export blocked by validation errors. Fix errors in the Validate screen.', 'error');
                this.$changeScreen('validate');
                return;
            }

            const blob = await buildLcpBlob(this.project);
            const fileName = createDownloadName(this.project);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            this.status(`Exported ${fileName}.`, 'info');
        },

        runValidation() {
            this.validation = validateProject(this.project);
            return this.validation;
        },

        jumpToIssue(issue) {
            if (!issue?.path) {
                this.$changeScreen('editor');
                return;
            }

            const path = issue.path;
            const match = path.match(/^([a-z_]+)\[(\d+)\]/i);
            if (match) {
                const [, category, index] = match;
                if (this.project.content[category] !== undefined) {
                    this.selectCategory(category);
                    this.selectItem(Number(index));
                }
            } else if (path.startsWith('manifest')) {
                this.activeField = 'manifest';
            }

            this.$changeScreen('editor');
        },

        issueClass(severity) {
            if (severity === 'error') {
                return 'issue issue-error';
            }
            if (severity === 'warning') {
                return 'issue issue-warning';
            }
            return 'issue issue-info';
        },

        status(message, level = 'info') {
            this.statusMessage = message;
            this.statusLevel = level;
        },

        markDirty(optionalStatusMessage = '') {
            this.project.meta.updatedAt = new Date().toISOString();
            if (this.project.settings.autoValidate) {
                this.runValidation();
            }
            this.debouncedAutosave();
            if (optionalStatusMessage) {
                this.status(optionalStatusMessage, 'info');
            }
        },

        debouncedAutosave() {
            clearTimeout(this.saveDebounceTimer);
            this.saveDebounceTimer = setTimeout(() => {
                saveAutosave(cloneProject(this.project));
                this.lastAutosaveAt = new Date().toLocaleTimeString();
            }, 350);
        },

        effectsClass() {
            return this.project.settings.effectsEnabled ? 'effects-on' : 'effects-off';
        },

        motionClass() {
            return this.project.settings.reducedMotion ? 'reduced-motion' : '';
        },

        serializeField(value) {
            return stringForField(value);
        },

        formatIssueScope(scope) {
            if (!scope) {
                return 'General';
            }
            return scope.replaceAll('_', ' ');
        },

        buildFieldPlaceholder(fieldName) {
            if (fieldName === 'dependencies') {
                return '[{"name":"required-pack","version":"1.0.0"}]';
            }
            if (fieldName === 'stats') {
                return '{"hp":8,"speed":4}';
            }
            if (fieldName === 'damage') {
                return '[{"type":"kinetic","val":"1d6"}]';
            }
            if (fieldName === 'range') {
                return '[{"type":"Range","val":10}]';
            }
            return '';
        },

        displayItemLabel(item, index) {
            if (!item || typeof item !== 'object') {
                return `Item ${index + 1}`;
            }
            if (item.name) {
                return item.name;
            }
            if (item.id) {
                return item.id;
            }
            return `Item ${index + 1}`;
        },

        manifestsLikelyJson() {
            return isLikelyJson(this.manifestRaw);
        },

        filteredCategories() {
            const query = this.categoryFilter.trim().toLowerCase();
            if (!query) {
                return this.categories;
            }
            return this.categories.filter((category) => {
                return category.label.toLowerCase().includes(query) || category.key.toLowerCase().includes(query);
            });
        }
    };
}
