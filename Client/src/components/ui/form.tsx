import { createContext, useContext, useId, HTMLAttributes } from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={`space-y-2 ${className}`} {...props} />
    </FormItemContext.Provider>
  );
};

const FormLabel = ({ className = '', ...props }: HTMLAttributes<HTMLLabelElement>) => {
  const { error, formItemId } = useFormField();

  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        error ? 'text-destructive' : ''
      } ${className}`}
      htmlFor={formItemId}
      {...props}
    />
  );
};

const FormControl = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <div
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

const FormDescription = ({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
};

const FormMessage = ({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={`text-sm font-medium text-destructive ${className}`}
      {...props}
    >
      {body}
    </p>
  );
};

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};