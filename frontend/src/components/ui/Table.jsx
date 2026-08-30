import React from 'react';

const Table = ({
  columns = [],
  data = [],
  emptyMessage = 'No data available',
  className = '',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-lg border border-[var(--bs-border-light)] ${className}`} {...props}>
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-tertiary)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bs-text-tertiary)]"
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--bs-border-light)]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-[var(--bs-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="bg-[var(--bs-bg-primary)] hover:bg-[var(--bs-bg-secondary)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-[var(--bs-text-primary)]"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
