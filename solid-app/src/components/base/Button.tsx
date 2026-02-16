import type { JSX } from "solid-js";
import { splitProps } from "solid-js";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: JSX.Element;
}

function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "variant",
    "size",
    "disabled",
    "onClick",
    "type",
    "children",
    "class",
  ]);

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      disabled={local.disabled}
      onClick={local.onClick}
      classList={{
        [local.class ?? ""]: !!local.class,
        button: true,
        "button--primary": local.variant === "primary" || !local.variant,
        "button--secondary": local.variant === "secondary",
        "button--danger": local.variant === "danger",
        "button--ghost": local.variant === "ghost",
        "button--sm": local.size === "sm",
        "button--md": local.size === "md" || !local.size,
        "button--lg": local.size === "lg",
        "button--disabled": local.disabled,
      }}
    >
      {local.children}
    </button>
  );
}

export default Button;
