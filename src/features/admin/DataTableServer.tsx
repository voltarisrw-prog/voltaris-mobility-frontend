/** Server-rendered table for read-only admin lists — no client JS needed. */
export function DataTableServer({
  headers,
  rows,
  caption,
  empty,
}: {
  headers: string[];
  rows: { key: string; cells: React.ReactNode[] }[];
  caption: string;
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-hairline p-8 text-center text-sm text-steel">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-chrome">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="eyebrow whitespace-nowrap py-3 pr-4 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-hairline/60">
              {row.cells.map((cell, index) => (
                <td key={index} className="py-3 pr-4 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
