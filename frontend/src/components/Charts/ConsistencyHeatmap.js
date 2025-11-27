import React from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

/**
 * A GitHub-style heatmap component to visualize user activity over the current year.
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - An array of activity data. Each object should have an '_id' (date string 'yyyy-MM-dd') and 'count'.
 */
const ConsistencyHeatmap = ({ data }) => {
  // Memoize the calculation of weeks and months to avoid re-computing on every render.
  const { weeks, months } = React.useMemo(() => {
    const today = new Date();
    const yearStart = startOfYear(today);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: endOfYear(today) });

    // Create a Map for quick lookups of counts by date ('yyyy-MM-dd')
    const dataMap = new Map((data || []).map(item => [item._id, item.count]));

    // This array will hold all the cells for the grid, including empty placeholders.
    const allCells = [];

    // Add empty placeholders for days before the start of the year in the first week.
    const firstDayOfWeek = getDay(yearStart);
    for (let i = 0; i < firstDayOfWeek; i++) {
      allCells.push(null);
    }

    // Populate the cells with actual day data.
    daysInYear.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      allCells.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
    });

    // Group all cells into weeks (7 days per week).
    const weeks = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }

    // Generate month labels based on where each month starts in the grid.
    const months = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstAvailableDayInWeek = week.find(day => day !== null);
      if (!firstAvailableDayInWeek) return;
      
      const dateForMonth = new Date(firstAvailableDayInWeek.date + 'T00:00:00');
      const monthOfFirstDay = dateForMonth.getMonth();

      if (monthOfFirstDay !== lastMonth) {
        // A simple heuristic to avoid month label overlaps.
        if (months.length === 0 || weekIndex > (months[months.length - 1].week + 3)) {
          months.push({
            week: weekIndex,
            month: format(dateForMonth, 'MMM'),
          });
          lastMonth = monthOfFirstDay;
        }
      }
    });

    return { weeks, months };
  }, [data]);

  // Determines the background color of a cell based on the activity count.
  const getIntensity = (count) => {
    const safeCount = count || 0;
    if (safeCount === 0) return 'bg-gray-100 dark:bg-slate-800';
    if (safeCount === 1) return 'bg-green-200 dark:bg-green-900';
    if (safeCount <= 3) return 'bg-green-400 dark:bg-green-700';
    if (safeCount <= 5) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  // Generates the tooltip text for a given day.
  const getTooltipText = (date, count) => {
    const safeCount = count || 0;
    // Parse date as UTC to prevent timezone-related date shifts
    const correctedDate = new Date(date + 'T00:00:00');
    return `${format(correctedDate, 'MMM dd, yyyy')}: ${safeCount} problem${safeCount !== 1 ? 's' : ''} solved`;
  };

  return (
    <div className="card bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 sm:p-6 w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Consistency Heatmap
      </h3>
      
      <div className="flex flex-col w-full">
        {/* Month Labels - Responsive positioning */}
        <div className="relative h-6 w-full" style={{ paddingLeft: '32px' }}>
          {months.map(({ week, month }) => (
            <div
              key={week}
              className="absolute top-0 text-xs font-medium text-gray-600 dark:text-gray-300"
              style={{ 
                left: `calc(32px + ${week} * (100% - 32px) / ${weeks.length})`,
                transform: 'translateX(-50%)'
              }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex w-full mt-1">
          {/* Day Labels */}
          <div className="flex flex-col text-xs font-medium text-gray-600 dark:text-gray-300 pr-3 w-8 flex-shrink-0">
            <div className="h-3 mt-0.5"></div> {/* Spacer */}
            <div className="h-3 flex items-center">Mon</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Wed</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">Fri</div>
            <div className="h-3"></div>
          </div>

          {/* Heatmap Grid - Full width utilization */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between" style={{ gap: 'calc(100% / 260)' }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: '1px' }}>
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div 
                          key={dayIndex} 
                          className="w-3 h-3" 
                          style={{ 
                            width: 'max(10px, min(14px, calc(100vw / 60)))',
                            height: 'max(10px, min(14px, calc(100vw / 60)))'
                          }}
                        />
                      );
                    }
                    const isToday = isSameDay(new Date(day.date + 'T00:00:00'), new Date());
                    return (
                      <div
                        key={day.date}
                        className={`rounded-sm border border-gray-200 dark:border-gray-700 ${getIntensity(day.count)} ${
                          isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } cursor-pointer hover:scale-110 hover:z-10 transition-all duration-150 ease-in-out hover:shadow-lg`}
                        style={{ 
                          width: 'max(10px, min(14px, calc(100vw / 60)))',
                          height: 'max(10px, min(14px, calc(100vw / 60)))'
                        }}
                        title={getTooltipText(day.date, day.count)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Enhanced styling */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(), 'yyyy')} Activity
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-slate-800 rounded-sm border border-gray-300 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm border border-gray-300 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm border border-gray-300 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm border border-gray-300 dark:border-gray-600"></div>
            <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm border border-gray-300 dark:border-gray-600"></div>
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">More</span>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyHeatmap;