import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({ columns, data, keyField = '_id', onRowClick, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    // If the current page goes out of bounds (e.g. items deleted), reset to page 1
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages, currentPage]);

  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="w-full bg-white dark:bg-mocha rounded-lg shadow-soft flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-vanilla dark:bg-espresso text-chocolate dark:text-crema border-b border-gray-100 dark:border-cacao">
              {columns.map((col, index) => (
                <th key={index} className="p-section font-semibold text-sm tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-section text-center text-slateGray dark:text-latte py-12">
                  No data available.
                </td>
              </tr>
            ) : (
              currentData.map((row) => (
                <tr 
                  key={row[keyField]} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group ${onRowClick ? 'cursor-pointer hover:bg-vanilla/50 transition-colors' : ''}`}
                >
                  {columns.map((col, index) => (
                    <td key={index} className="p-section text-sm text-slateGray dark:text-latte align-middle">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-cacao flex items-center justify-between bg-white dark:bg-mocha rounded-b-lg">
          <p className="text-sm text-slateGray dark:text-latte">
            Showing <span className="font-medium text-chocolate dark:text-crema">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-chocolate dark:text-crema">{Math.min(currentPage * itemsPerPage, data.length)}</span> of <span className="font-medium text-chocolate dark:text-crema">{data.length}</span> results
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1 rounded bg-vanilla dark:bg-espresso text-chocolate dark:text-crema disabled:opacity-50 disabled:cursor-not-allowed hover:bg-caramel/20 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-chocolate dark:text-crema">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-vanilla dark:bg-espresso text-chocolate dark:text-crema disabled:opacity-50 disabled:cursor-not-allowed hover:bg-caramel/20 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
