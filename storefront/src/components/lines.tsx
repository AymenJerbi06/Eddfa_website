// Titles are written as short sentences on separate lines ("Votre intérieur.\nVotre projet."): the first line is the
// statement, the lines after it answer it in a lighter weight.
export function Lines({ text }: { text: string }) {
  const [first, ...rest] = text.split("\n");
  return <>{first}{rest.map(line => <span key={line} className="soft">{line}</span>)}</>;
}
