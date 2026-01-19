interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const baseButtonStyles = `
    relative inline-flex items-center justify-center
    text-sm font-medium
    transition-all duration-200 ease-out
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
  `;

  const navButtonStyles = `
    ${baseButtonStyles}
    p-2.5 rounded-xl
    bg-white/60 hover:bg-white
    text-surface-500 hover:text-primary-600
    hover:-translate-y-0.5 hover:shadow-sm
  `;

  const pageButtonStyles = (isActive: boolean) => `
    ${baseButtonStyles}
    px-4 py-2.5 rounded-xl
    ${
      isActive
        ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-soft'
        : 'bg-white/60 text-surface-700 hover:bg-white hover:shadow-sm hover:-translate-y-0.5'
    }
  `;

  return (
    <div className="flex items-center justify-between px-4 py-4 glass-card rounded-xl mt-4">
      {/* Mobile pagination */}
      <div className="flex justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseButtonStyles} px-4 py-2.5 rounded-xl bg-white/60 text-surface-700 hover:bg-white hover:shadow-sm`}
        >
          Previous
        </button>
        <span className="flex items-center text-sm text-surface-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseButtonStyles} px-4 py-2.5 rounded-xl bg-white/60 text-surface-700 hover:bg-white hover:shadow-sm`}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-surface-600">
            {totalItems && itemsPerPage && (
              <>
                Showing{' '}
                <span className="font-semibold text-surface-800">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                </span>
                {' '}-{' '}
                <span className="font-semibold text-surface-800">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>
                {' '}of{' '}
                <span className="font-semibold text-surface-800">{totalItems}</span>
                {' '}results
              </>
            )}
          </p>
        </div>

        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={navButtonStyles}
          >
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {startPage > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className={pageButtonStyles(false)}>
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-surface-400">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={pageButtonStyles(page === currentPage)}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-surface-400">...</span>
              )}
              <button onClick={() => onPageChange(totalPages)} className={pageButtonStyles(false)}>
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={navButtonStyles}
          >
            <span className="sr-only">Next</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}

