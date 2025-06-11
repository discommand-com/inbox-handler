import { getCurrentFilename, getCurrentDirname } from '../src/esm-filename.mjs';
import path from 'path';

describe('esm-filename.mjs', () => {
  it('returns file path from meta.url', () => {
    const fakeMeta = { url: 'file:///C:/tmp/test.mjs' };
    const result = getCurrentFilename(fakeMeta).replace(/\\/g, '/');
    expect(result.endsWith('/test.mjs')).toBe(true);
  });

  it('returns __filename fallback if meta is missing', () => {
    global.__filename = '/tmp/fallback.mjs';
    expect(getCurrentFilename()).toBe('/tmp/fallback.mjs');
    delete global.__filename;
  });

  it('returns dirname from meta.url', () => {
    const fakeMeta = { url: 'file:///C:/tmp/test.mjs' };
    const expectedPath = path.dirname(new URL(fakeMeta.url).pathname);
    const normalizedExpected = process.platform === 'win32' && expectedPath.startsWith('/')
      ? expectedPath.slice(1)
      : expectedPath;
    const result = getCurrentDirname(fakeMeta).replace(/\\/g, '/');
    expect(result).toBe(normalizedExpected);
  });

  it('returns empty string if no filename', () => {
    expect(getCurrentDirname({})).toBe('');
  });
});
