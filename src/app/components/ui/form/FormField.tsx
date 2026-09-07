import { cn } from "../../../../lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
};

export default function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
  labelClassName,
  errorClassName,
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "mb-2 block text-sm font-medium text-zinc-200 md:text-base",
          labelClassName,
        )}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={errorId}
          className={cn("mt-2 text-red-400", errorClassName)}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
