import React from 'react';

export default function SkeletonRow({ columns = 6, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <td key={column}>
              <div
                style={{
                  height: 14,
                  width: column === 0 ? 86 : '70%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, var(--purple-50), var(--purple-100), var(--purple-50))',
                  backgroundSize: '200% 100%',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
