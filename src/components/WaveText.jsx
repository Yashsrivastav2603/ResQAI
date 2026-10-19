/** Splits text into letters so the active disaster mode can ripple / shake / flicker them. */
export default function WaveText({ text }) {
  return <span className="grad sp" aria-label={text}>{[...text].map((c, i) => <s key={i} style={{ '--i': i }} aria-hidden="true">{c}</s>)}</span>;
}
