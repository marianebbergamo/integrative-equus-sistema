import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";

export function Table({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-borda bg-superficie px-5">
      <table
        className={`w-full min-w-[720px] border-collapse text-[15px] ${className}`}
        {...props}
      />
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className="text-left text-xs font-semibold tracking-wide text-texto-secundario uppercase"
      {...props}
    />
  );
}

export function TableRow({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-t border-[#eee8e0] ${className}`} {...props} />;
}

export function Th({
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`py-3.5 px-2.5 first:pl-0 last:pr-0 ${className}`}
      {...props}
    />
  );
}

export function Td({
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-3 px-2.5 first:pl-0 last:pr-0 ${className}`}
      {...props}
    />
  );
}
