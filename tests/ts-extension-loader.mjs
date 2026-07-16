import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const hasExtension = (specifier) => /\.[a-z0-9]+$/i.test(specifier);

export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !hasExtension(specifier)) {
    for (const target of [`${specifier}.ts`, `${specifier}/index.ts`]) {
      const candidate = new URL(target, context.parentURL);
      try {
        await access(fileURLToPath(candidate));
        return {
          shortCircuit: true,
          url: pathToFileURL(fileURLToPath(candidate)).href,
        };
      } catch {
        // Try the next local TypeScript resolution shape.
      }
    }
  }

  return nextResolve(specifier, context);
}
