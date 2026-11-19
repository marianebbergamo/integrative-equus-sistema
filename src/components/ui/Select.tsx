import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, id, className = "", children, ...props }, ref) {
    const gerado = useId();
    const selectId = id ?? gerado;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-texto">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`box-border h-11 w-full rounded-lg border border-[#cfc8bf] bg-superficie px-3.5 text-[15px] text-texto focus:border-bordo focus:outline-2 focus:outline-offset-1 focus:outline-bordo ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  },
);
