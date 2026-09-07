import { forwardRef, type SelectHTMLAttributes } from "react";

import FormField from "./FormField";
import NeonSelect from "./NeonSelect";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | null;
  fieldClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
};

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      id,
      fieldClassName,
      labelClassName,
      errorClassName,
      className,
      children,
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
      <NeonSelect
        ref={ref}
        id={id}
        className={className}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </NeonSelect>
    </FormField>
  ),
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
