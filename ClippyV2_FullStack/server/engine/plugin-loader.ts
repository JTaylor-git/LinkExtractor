import path from 'path';
import fs from 'fs/promises';

export async function runPlugin(pluginId: string, input: string): Promise<any> {
    const pluginPath = path.resolve(__dirname, '../../plugins', pluginId, 'script.ts');
    const manifestPath = path.resolve(__dirname, '../../plugins', pluginId, 'manifest.json');

    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const { default: pluginFunc } = await import(pluginPath);
    return pluginFunc(input);
}