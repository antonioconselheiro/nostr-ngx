import { AuthResultset } from './auth.resultset';
import { ClosedResultset } from './closed.resultset';
import { CountResultset } from './count.resultset';
import { EoseResultset } from './eose.resultset';
import { EventResultset } from './event.resultset';
import { NoticeResultset } from './notice.resultset';
import { OkResultset } from './ok.resultset';

export type NostrResultset = AuthResultset | ClosedResultset | CountResultset | EoseResultset | EventResultset | NoticeResultset | OkResultset;
