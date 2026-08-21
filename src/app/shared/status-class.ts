export function statusClass(status: string): string {
  const slug = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(' ', '-');

  return `status status-${slug}`;
}
