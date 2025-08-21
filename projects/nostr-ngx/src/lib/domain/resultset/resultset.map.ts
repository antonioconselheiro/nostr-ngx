import { ClosedResultset } from "./closed.resultset";
import { CountResultset } from "./count.resultset";
import { EoseResultset } from "./eose.resultset";
import { EventResultset } from "./event.resultset";
import { NoticeResultset } from "./notice.resultset";
import { OkResultset } from "./ok.resultset";

export type ResultsetMap = {
  [k: `ok:${string}`]: OkResultset;
  [k: `sub:${string}`]: EventResultset | EoseResultset | ClosedResultset;
  [k: `count:${string}`]: CountResultset;
  notice: NoticeResultset;
};