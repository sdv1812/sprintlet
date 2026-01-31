'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Location, CapacityInput } from '@/types';
import {
  calculateCapacity,
  saveCapacityToLocalStorage,
  loadCapacityFromLocalStorage,
} from '@/lib/capacity';
import { nanoid } from 'nanoid';

export default function CapacityPage() {
  const [sprintDays, setSprintDays] = useState(() => {
    const saved = loadCapacityFromLocalStorage();
    return saved?.sprintDays ?? 10;
  });
  const [averageVelocity, setAverageVelocity] = useState(() => {
    const saved = loadCapacityFromLocalStorage();
    return saved?.averageVelocity ?? 0;
  });
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = loadCapacityFromLocalStorage();
    return (
      saved?.locations ?? [
        { id: nanoid(8), name: '', publicHolidays: 0, leaveDays: 0, numEngineers: 0 },
      ]
    );
  });
  const [result, setResult] = useState<ReturnType<typeof calculateCapacity> | null>(null);

  const addLocation = () => {
    setLocations([
      ...locations,
      { id: nanoid(8), name: '', publicHolidays: 0, leaveDays: 0, numEngineers: 0 },
    ]);
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const updateLocation = (id: string, field: keyof Location, value: string | number) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)));
  };

  const handleCalculate = () => {
    const input: CapacityInput = {
      sprintDays,
      averageVelocity,
      locations,
    };

    const calculatedResult = calculateCapacity(input);
    setResult(calculatedResult);
    saveCapacityToLocalStorage(input);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      localStorage.removeItem('capacityInput');
      setSprintDays(10);
      setAverageVelocity(0);
      setLocations([{ id: nanoid(8), name: '', publicHolidays: 0, leaveDays: 0, numEngineers: 0 }]);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2"
            >
              ← Back to Home
            </Link>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear All Data
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Capacity Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Calculate your team&apos;s sprint capacity with precision
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="space-y-6">
              {/* Sprint Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sprint Duration (Days)
                </label>
                <input
                  type="number"
                  value={sprintDays || ''}
                  onChange={(e) => setSprintDays(Number(e.target.value) || 0)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total number of working days in the sprint
                </p>
              </div>

              {/* Average Velocity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Sprint Velocity (Story Points)
                </label>
                <input
                  type="number"
                  value={averageVelocity || ''}
                  onChange={(e) => setAverageVelocity(Number(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your team&apos;s typical velocity from past sprints
                </p>
              </div>

              {/* Locations */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Locations
                  </label>
                  <button
                    onClick={addLocation}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                  >
                    + Add Location
                  </button>
                </div>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Location Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., New York"
                            value={location.name}
                            onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Engineers
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={location.numEngineers || ''}
                            onChange={(e) =>
                              updateLocation(
                                location.id,
                                'numEngineers',
                                Number(e.target.value) || 0
                              )
                            }
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Public Holidays
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={location.publicHolidays || ''}
                            onChange={(e) =>
                              updateLocation(
                                location.id,
                                'publicHolidays',
                                Number(e.target.value) || 0
                              )
                            }
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Total Leave Days (Sum)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={location.leaveDays || ''}
                            onChange={(e) =>
                              updateLocation(location.id, 'leaveDays', Number(e.target.value) || 0)
                            }
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          {locations.length > 1 && (
                            <button
                              onClick={() => removeLocation(location.id)}
                              className="w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Calculate Capacity
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📈 Capacity Analysis
              </h2>

              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total Engineers
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {result.totalEngineers}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Maximum Person-Days
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {result.maxPersonDays}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Unavailable Days
                    </div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {result.unavailableDays}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      (Holidays + Leaves)
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Available Person-Days
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {result.availablePersonDays}
                    </div>
                  </div>
                </div>

                {/* Availability Percentage */}
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-700">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Team Availability
                    </div>
                    <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      {result.availabilityPercentage}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-400 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(result.availabilityPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Final Projected Capacity */}
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-4 border-green-300 dark:border-green-700">
                  <div className="text-center">
                    <div className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                      🎯 Projected Sprint Capacity
                    </div>
                    <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {result.projectedCapacity}
                    </div>
                    <div className="text-xl text-gray-600 dark:text-gray-400">Story Points</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Based on {averageVelocity} average velocity × {result.availabilityPercentage}%
                      availability
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Calculation Breakdown
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Sprint Days × Engineers:</span>
                      <span className="font-mono">
                        {sprintDays} × {result.totalEngineers} = {result.maxPersonDays} person-days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minus unavailable days:</span>
                      <span className="font-mono">
                        {result.maxPersonDays} - {result.unavailableDays} ={' '}
                        {result.availablePersonDays} person-days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Availability percentage:</span>
                      <span className="font-mono">
                        {result.availablePersonDays} / {result.maxPersonDays} ={' '}
                        {result.availabilityPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span>Projected capacity:</span>
                      <span className="font-mono">
                        {averageVelocity} × {result.availabilityPercentage}% ={' '}
                        {result.projectedCapacity} SP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
