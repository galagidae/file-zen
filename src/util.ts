export const getFilenameFromUri = (uri: string) => {
  if (typeof uri !== 'string') {
    return '';
  }

  return uri.substring(uri.lastIndexOf('/') + 1);
};
