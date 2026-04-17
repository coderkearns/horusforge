import { parseLcpArchiveFromArrayBuffer } from './lcp-archive-service.js';

export async function importLcpFromUrl(url) {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`URL import failed (${response.status} ${response.statusText}).`);
    }
    const buffer = await response.arrayBuffer();
    return parseLcpArchiveFromArrayBuffer(buffer, url);
}
