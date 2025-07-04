import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn } from 'app/shared/utils/className';
import { AppLabel } from 'app/shared/components/ui/label/AppLabel';

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppForm` component provides a comprehensive, type-safe, and accessible form solution
 * built on top of React Hook Form and Zod validation.
 *
 * ## Key Features
 * - Type-safe form validation with Zod
 * - Accessible form components
 * - Seamless integration with React Hook Form
 * - Tailwind CSS styling
 *
 * ## Example Usage
 * ```tsx
 * import { z } from 'zod';
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { AppForm } from 'app/shared/components/form/AppForm';
 * import { AppInput } from 'app/shared/components/input/AppInput';
 * import { AppButton } from 'app/shared/components/button/AppButton';
 *
 * // Define Zod validation schema
 * const contactSchema = z.object({
 *   name: z.string().min(2, "Name must be at least 2 characters"),
 *   email: z.string().email("Invalid email address"),
 *   message: z.string().optional()
 * });
 *
 * function ContactForm() {
 *   // Initialize form with Zod resolver
 *   const form = useForm({
 *     resolver: zodResolver(contactSchema),
 *     defaultValues: {
 *       name: '',
 *       email: '',
 *       message: ''
 *     }
 *   });
 *
 *   // Form submission handler
 *   function onSubmit(data) {
 *     console.log('Form submitted:', data);
 *   }
 *
 *   return (
 *     <AppForm.Root {...form}>
 *       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 *         <AppForm.Field
 *           control={form.control}
 *           name="name"
 *           render={({ field }) => (
 *             <AppForm.Item>
 *               <AppForm.Label>Full Name</AppForm.Label>
 *               <AppForm.Control>
 *                 <AppInput placeholder="Enter your name" {...field} />
 *               </AppForm.Control>
 *               <AppForm.Message />
 *             </AppForm.Item>
 *           )}
 *         />
 *
 *         <AppForm.Field
 *           control={form.control}
 *           name="email"
 *           render={({ field }) => (
 *             <AppForm.Item>
 *               <AppForm.Label>Email Address</AppForm.Label>
 *               <AppForm.Control>
 *                 <AppInput type="email" placeholder="you@example.com" {...field} />
 *               </AppForm.Control>
 *               <AppForm.Message />
 *             </AppForm.Item>
 *           )}
 *         />
 *
 *         <AppForm.Field
 *           control={form.control}
 *           name="message"
 *           render={({ field }) => (
 *             <AppForm.Item>
 *               <AppForm.Label>Message (Optional)</AppForm.Label>
 *               <AppForm.Control>
 *                 <AppInput placeholder="Your message..." {...field} />
 *               </AppForm.Control>
 *               <AppForm.Description>
 *                 Share any additional details you'd like us to know
 *               </AppForm.Description>
 *             </AppForm.Item>
 *           )}
 *         />
 *
 *         <AppButton type="submit">Send Message</AppButton>
 *       </form>
 *     </AppForm.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppForm` components using absolute import from `app/shared/components/form/AppForm`.
 * 2. Define a Zod schema to validate form inputs.
 * 3. Use `useForm` with `zodResolver` to create form state and validation.
 * 4. Wrap the form with `<AppForm.Root>` and spread the form object.
 * 5. Use `<AppForm.Field>` for each form input, providing:
 *    - `control` from the form object
 *    - `name` matching the Zod schema
 *    - `render` prop with field rendering logic
 * 6. Inside each `<AppForm.Field>`, use:
 *    - `<AppForm.Item>` as a container
 *    - `<AppForm.Label>` for input labels
 *    - `<AppForm.Control>` to wrap the actual input
 *    - `<AppForm.Message>` for validation error messages
 *    - Optional `<AppForm.Description>` for additional context
 * 7. Use `form.handleSubmit()` to handle form submission with type-safe data
 *
 * ## Best Practices
 * - Always use Zod for form validation
 * - Provide clear, descriptive error messages
 * - Use `defaultValues` to set initial form state
 * - Leverage TypeScript for type inference
 *
 * @see https://react-hook-form.com/ React Hook Form Documentation
 * @see https://zod.dev/ Zod Validation Documentation
 * @category Form
 * @category Components
 */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

/**
 * @description Controlled form field component for managing individual form inputs
 *
 * @remarks
 * Wraps the React Hook Form `Controller` and provides context for form field management
 *
 * @template TFieldValues The type of form values
 * @template TName The name of the form field
 *
 * @param props Controller props from react-hook-form
 * @returns A controlled form field with context
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

/**
 * @description Custom hook for accessing form field state and metadata
 *
 * @remarks
 * Provides detailed information about a form field's current state,
 * including error handling and accessibility attributes
 *
 * @returns An object with form field metadata and state
 * @throws Error if used outside of a FormField context
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
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

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * @description Container for a single form field with unique identifier
 *
 * @remarks
 * Provides a context for form field components, ensuring proper
 * accessibility and identification
 *
 * @param className Optional Tailwind CSS classes
 * @param props Additional div props
 * @returns A form item with unique context
 */
function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot='form-item' className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

/**
 * @description Form field label with built-in error state handling
 *
 * @remarks
 * Renders a label with automatic error state styling and
 * proper accessibility attributes
 *
 * @param className Optional Tailwind CSS classes
 * @param props Additional label props
 * @returns A form label with error state support
 */
function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <AppLabel
      data-slot='form-label'
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * @description Wrapper for form control inputs with accessibility attributes
 *
 * @remarks
 * Provides proper aria attributes and error handling for form inputs
 *
 * @param props Slot component props
 * @returns A form control with enhanced accessibility
 */
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot='form-control'
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

/**
 * @description Optional description text for a form field
 *
 * @remarks
 * Renders a muted description text with proper accessibility ID
 *
 * @param className Optional Tailwind CSS classes
 * @param props Additional paragraph props
 * @returns A form field description
 */
function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot='form-description'
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * @description Error message display for form fields
 *
 * @remarks
 * Renders validation error messages with proper styling and accessibility
 *
 * @param className Optional Tailwind CSS classes
 * @param props Additional paragraph props
 * @returns A form field error message or null
 */
function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot='form-message'
      id={formMessageId}
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}>
      {body}
    </p>
  );
}

/**
 * @description Composable form components for building accessible and type-safe forms
 *
 * @remarks
 * Provides a comprehensive set of form components that work together
 * to create robust, accessible, and type-safe forms
 *
 * @property {Function} Root Form provider component
 * @property {Function} Field Controlled form field component
 * @property {Function} Item Container for a single form field
 * @property {Function} Label Form field label
 * @property {Function} Control Input control wrapper
 * @property {Function} Description Optional field description
 * @property {Function} Message Error message display
 */
export const AppForm = {
  Root: Form,
  Field: FormField,
  Item: FormItem,
  Label: FormLabel,
  Control: FormControl,
  Description: FormDescription,
  Message: FormMessage,
};
