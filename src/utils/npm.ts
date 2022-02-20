const legacyNodeVersions = ['12', '14'];
const [nodeVersion] = process.version.substring(1).split('.');
const isLegacyNpm = legacyNodeVersions.includes(nodeVersion);

export function npmInit(command: string, args: string) {
  const sep = isLegacyNpm ? '' : '--';
  return `npm init ${command} ${sep} ${args}`;
}
