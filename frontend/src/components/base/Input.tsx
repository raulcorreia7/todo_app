import type { JSX } from "solid-js";
import { splitProps } from "solid-js";

interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput"
> {
  value?: string;
  onInput?: (value: string) => void;
}

function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    "value",
    "onInput",
    "placeholder",
    "type",
    "disabled",
    "maxlength",
    "class",
    "id",
    "name",
    "aria-label",
  ]);

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    local.onInput?.(target.value);
  };

  return (
    <input
      {...others}
      type={local.type ?? "text"}
      value={local.value ?? ""}
      onInput={handleInput}
      placeholder={local.placeholder}
      disabled={local.disabled}
      maxlength={local.maxlength}
      id={local.id}
      name={local.name}
      aria-label={local["aria-label"]}
      classList={{
        [local.class ?? ""]: !!local.class,
        input: true,
      }}
    />
  );
}

export default Input;
