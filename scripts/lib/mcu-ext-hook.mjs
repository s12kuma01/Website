export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      err?.code === 'ERR_MODULE_NOT_FOUND' &&
      /material-color-utilities/.test(context.parentURL ?? '') &&
      !specifier.endsWith('.js')
    ) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw err;
  }
}
