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
    p-2.5 rounded-lg
    bg-[var(--surface-2)] hover:bg-surface-300
    text-surface-600 hover:text-surface-900
    border border-[var(--border)]
  `;

  const pageButtonStyles = (isActive: boolean) => `
    ${baseButtonStyles}
    px-4 py-2 rounded-lg
    ${
      isActive
        ? 'bg-[var(--accent)] text-[#111] font-semibold'
        : 'bg-[var(--surface-2)] text-surface-700 hover:bg-surface-300 border border-[var(--border)]'
    }
  `;

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl mt-4">
      {/* Mobile pagination */}
      <div className="flex justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseButtonStyles} px-4 py-2 rounded-lg bg-[var(--surface-2)] text-surface-700 hover:bg-surface-300 border border-[var(--border)]`}
        >
          Previous
        </button>
        <span className="flex items-center text-sm text-surface-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseButtonStyles} px-4 py-2 rounded-lg bg-[var(--surface-2)] text-surface-700 hover:bg-surface-300 border border-[var(--border)]`}
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
                <span className="px-2 text-surface-500">...</span>
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
                <span className="px-2 text-surface-500">...</span>
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
