import { buttonClass, type ButtonSize, type ButtonVariant } from "@/components/styles";
import { Spinner } from "./states";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // shows a spinner and blocks clicks while something is saving
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClass(variant, size)} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
