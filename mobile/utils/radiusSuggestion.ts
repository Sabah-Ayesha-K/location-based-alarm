export function suggestRadius(address: string | null): number {
  if (!address) return 100;

  const text = address.toLowerCase();

  // Transport hubs → large radius
  if (
    text.includes('station') ||
    text.includes('railway') ||
    text.includes('airport') ||
    text.includes('metro')
  ) {
    return 300;
  }

  // Educational places
  if (
    text.includes('college') ||
    text.includes('university') ||
    text.includes('school')
  ) {
    return 200;
  }

  // Offices / tech parks
  if (
    text.includes('office') ||
    text.includes('tech park') ||
    text.includes('business')
  ) {
    return 150;
  }

  // Shopping / malls
  if (
    text.includes('mall') ||
    text.includes('market') ||
    text.includes('shopping')
  ) {
    return 200;
  }

  // Default
  return 100;
}