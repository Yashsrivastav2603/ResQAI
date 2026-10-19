import { STATUSES, ago, pretty } from '../utils/format';

export default function Timeline({ status, events = [] }) {
  const cur = STATUSES.indexOf(status);
  return (
    <div className="tl">
      {STATUSES.map((s, i) => {
        const ev = events.find((e) => e.status === s);
        return <div key={s} className={i <= cur ? 'd' : ''}><b>{pretty(s)}</b>{ev && <div className="mu">{ago(ev.at)}</div>}</div>;
      })}
    </div>
  );
}
