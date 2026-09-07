import { forwardRef, type TextareaHTMLAttributes } from "react";

import FormField from "./FormField";
import NeonTextarea from "./NeonTextarea";

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string | null;
  fieldClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
};

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      id,
      fieldClassName,
      labelClassName,
      errorClassName,
      className,
      ...props
    },
    ref,
  ) => (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      className={fieldClassName}
      labelClassName={labelClassName}
      errorClassName={errorClassName}
    >
      <NeonTextarea
        ref={ref}
        id={id}
        className={className}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...props}
      />
    </FormField>
  ),
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
