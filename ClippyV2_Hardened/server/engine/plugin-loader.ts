import path from 'path';
import fs from 'fs/promises';

export async function runPlugin(pluginId: string, input: string): Promise<any> {
    try {
        const baseDir = path.resolve(__dirname, '../../plugins', pluginId);
        const manifestPath = path.join(baseDir, 'manifest.json');
        const pluginPath = path.join(baseDir, 'script.ts');

        const manifestRaw = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestRaw);

        if (!manifest.entry || !pluginPath.endsWith(manifest.entry)) {
            throw new Error("Invalid or missing entry script in manifest.");
        }

        const { default: pluginFunc } = await import(pluginPath);
        if (typeof pluginFunc !== 'function') {
            throw new Error("Plugin script does not export a default function.");
        }

        const output = await pluginFunc(input);
        return output;

    } catch (error) {
        console.error(`Plugin execution error [${pluginId}]:`, error.message);
        throw new Error(`Execution failed for plugin '${pluginId}': ${error.message}`);
    }
}