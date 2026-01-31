import { CapacityInput, CapacityResult } from '@/types';

export function calculateCapacity(input: CapacityInput): CapacityResult {
  const { sprintDays, averageVelocity, locations } = input;

  // Calculate totals
  const totalEngineers = locations.reduce((sum, loc) => sum + loc.numEngineers, 0);
  const maxPersonDays = sprintDays * totalEngineers;

  // Calculate unavailable days across all locations
  const unavailableDays = locations.reduce((sum, loc) => {
    // Public holidays affect all engineers, leave days is already a total sum
    const unavailablePerLocation = loc.publicHolidays * loc.numEngineers + loc.leaveDays;
    return sum + unavailablePerLocation;
  }, 0);

  const availablePersonDays = maxPersonDays - unavailableDays;
  const availabilityPercentage =
    maxPersonDays > 0 ? (availablePersonDays / maxPersonDays) * 100 : 0;

  // Calculate projected capacity based on availability
  const projectedCapacity = averageVelocity * (availabilityPercentage / 100);

  return {
    totalEngineers,
    maxPersonDays,
    unavailableDays,
    availablePersonDays,
    availabilityPercentage: Math.round(availabilityPercentage * 100) / 100,
    projectedCapacity: Math.round(projectedCapacity * 100) / 100,
  };
}

export function saveCapacityToLocalStorage(input: CapacityInput): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('capacityInput', JSON.stringify(input));
}

export function loadCapacityFromLocalStorage(): CapacityInput | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('capacityInput');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
