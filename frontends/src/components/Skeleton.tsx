import React from 'react';

/** A single shimmering placeholder block. */
export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}> = ({ width = '100%', height = 16, radius = 6, className = '' }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

/** Placeholder rows shown while a list/table loads. */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <div className="table-wrapper" aria-hidden="true">
    <table className="admin-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i}>
              <Skeleton width="60%" height={12} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c}>
                <Skeleton width={c === columns - 1 ? '72px' : '85%'} height={14} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Placeholder cards shown while a card grid (e.g. gallery) loads. */
export const CardGridSkeleton: React.FC<{ cards?: number }> = ({ cards = 6 }) => (
  <div className="gallery-list" aria-hidden="true">
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="gallery-item-card">
        <Skeleton height={180} radius={0} className="gallery-item-img" />
        <div className="gallery-item-body">
          <Skeleton width="70%" height={18} />
          <div style={{ height: 8 }} />
          <Skeleton width="45%" height={13} />
        </div>
      </div>
    ))}
  </div>
);

/** Small inline "Loading…" pill used on buttons and inline spots. */
export const InlineSkeleton: React.FC<{ width?: number }> = ({ width = 120 }) => (
  <span className="inline-skeleton" aria-hidden="true">
    <Skeleton width={width} height={14} />
  </span>
);
