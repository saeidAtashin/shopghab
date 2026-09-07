import { forwardRef, type InputHTMLAttributes } from "react";

import FormField from "./FormField";
import NeonInput from "./NeonInput";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  fieldClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
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
      <NeonInput
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

FormInput.displayName = "FormInput";

export default FormInput;
