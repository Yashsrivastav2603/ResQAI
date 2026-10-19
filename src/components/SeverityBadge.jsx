import { pretty } from '../utils/format';
export default function SeverityBadge({ level }) { return <span className={`badge ${level}`}>{pretty(level)}</span>; }
