import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hint, id, className = "", ...props }, ref) {
    const gerado = useId();
    const inputId = id ?? gerado;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-texto">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`box-border h-11 w-full rounded-lg border border-[#cfc8bf] bg-superficie px-3.5 text-[15px] text-texto placeholder:text-texto-secundario focus:border-bordo focus:outline-2 focus:outline-offset-1 focus:outline-bordo ${className}`}
          {...props}
        />
        {hint && <span className="text-xs text-texto-secundario">{hint}</span>}
      </div>
    );
  },
);
