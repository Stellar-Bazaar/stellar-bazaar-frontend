import React from 'react';

export interface FilterBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
  activeSort: string;
  onSelectSort: (sort: string) => void;
  totalCount?: number;
  className?: string;
}

export const CATEGORIES = [
  'All',
  'Food & Agriculture',
  'Electronics & Hardware',
  'Solar & Clean Energy',
  'Raw Materials',
  'Textiles & Apparel',
];

export const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'OPEN', label: 'Open for Buyers' },
  { id: 'QUORUM_REACHED', label: 'Quorum Reached' },
  { id: 'INSPECTION', label: 'Under Inspection' },
];

export const SORT_OPTIONS = [
  { id: 'volume_desc', label: 'Highest Volume' },
  { id: 'deadline_asc', label: 'Ending Soonest' },
  { id: 'price_asc', label: 'Lowest Target Price' },
  { id: 'participants_desc', label: 'Most Buyers' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  activeStatus,
  onSelectStatus,
  activeSort,
  onSelectSort,
  totalCount,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md backdrop-blur-sm space-y-3 ${className}`}
      data-testid="filter-bar"
    >
      {/* Top Row: Category Pills (Horizontal scrollable on mobile) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none select-none">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
              }`}
              data-testid={`filter-cat-${cat}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Bottom Row: Status Filter, Sort Dropdown & Count Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center space-x-2">
          {/* Status Select */}
          <select
            value={activeStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            aria-label="Filter by Circle Status"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            data-testid="status-select"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={activeSort}
            onChange={(e) => onSelectSort(e.target.value)}
            aria-label="Sort Circles"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            data-testid="sort-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Count Label */}
        {totalCount !== undefined && (
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-cyan-300 font-mono">{totalCount}</strong> circle{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
