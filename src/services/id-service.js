function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export function createSuggestedId(prefix, name, fallback = 'item') {
    const stem = slugify(name) || fallback;
    const safePrefix = slugify(prefix);
    return safePrefix ? `${safePrefix}_${stem}` : stem;
}

export function ensureUniqueId(existingIds, proposedId) {
    if (!existingIds.has(proposedId)) {
        return proposedId;
    }
    let count = 2;
    while (existingIds.has(`${proposedId}_${count}`)) {
        count += 1;
    }
    return `${proposedId}_${count}`;
}
