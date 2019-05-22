import { ISuite, ITest, IHook } from '../interfaces';

export type EntityType = 'suite' | 'test' | 'hook';
type Entity = ISuite | ITest | IHook;

function cleanFullTitle(title: string): string {
  return title
    .replace(/[^\w]+/g, '')
    .trim()
    .toLowerCase() || 'notitle';
}

function getSuiteTitle(suite: ISuite) {
  return suite.root ? 'root' : suite.fullTitle();
}

function getTestTitle(test: ITest) {
  return test.fullTitle();
}

function getHookTitle(hook: IHook) {
  return hook.title;
}

function getEntityTitle(entityType: EntityType, entity: Entity) {
  if (entityType === 'suite') return getSuiteTitle(entity as ISuite);
  if (entityType === 'test') return getTestTitle(entity as ITest);
  return getHookTitle(entity as IHook);
}

export function getMessageId(entityType: EntityType, entity: Entity, eventCounter: number) {
  const entityTitle = getEntityTitle(entityType, entity);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return `${entityType}_${(entity as any).file}_${cleanFullTitle(entityTitle)}_${eventCounter}`;
}
