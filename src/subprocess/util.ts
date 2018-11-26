export type EntityType = 'suite' | 'test' | 'hook';

function cleanFullTitle(title: string): string {
  return title
    .replace(/[^\w]+/g, '')
    .trim()
    .toLowerCase() || 'notitle';
}

export function getMessageId(entityType: EntityType, entityTitle: string, eventCounter: number) {
  return `${entityType}_${cleanFullTitle(entityTitle)}_${eventCounter}`;
}
