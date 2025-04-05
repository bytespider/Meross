export function randomId(): string {
  return (crypto.randomUUID() as string).replaceAll('-', '');
}

export default randomId;
