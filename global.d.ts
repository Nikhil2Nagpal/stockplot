import { Database } from 'sqlite';

declare global {
  var _db: Database | undefined;
}
