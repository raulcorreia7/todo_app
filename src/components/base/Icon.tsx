import { createMemo, Show, splitProps } from "solid-js";
import * as LucideIcons from "lucide-solid";

const EMOJI_ICON_PATTERN = /\p{Extended_Pictographic}/u;

interface IconProps {
  name: string;
  size?: number;
  class?: string;
}

function Icon(props: IconProps) {
  const [local] = splitProps(props, ["name", "size", "class"]);
  const size = () => local.size ?? 24;
  const isEmojiIcon = () => EMOJI_ICON_PATTERN.test(local.name);

  const iconName = () =>
    local.name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") as keyof typeof LucideIcons;

  const LucideIcon = createMemo(() => {
    if (isEmojiIcon()) {
      return undefined;
    }

    try {
      return LucideIcons[iconName()] as typeof LucideIcons.Icon | undefined;
    } catch {
      return undefined;
    }
  });

  return (
    <Show
      when={isEmojiIcon()}
      fallback={
        <Show when={LucideIcon()} fallback={null}>
          {(ResolvedIcon) => {
            const IconComponent = ResolvedIcon();
            return (
              <IconComponent size={size()} class={local.class} iconNode={[]} />
            );
          }}
        </Show>
      }
    >
      <span
        class={local.class}
        style={{
          "font-size": `${size()}px`,
          "line-height": "1",
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
        }}
        aria-hidden="true"
      >
        {local.name}
      </span>
    </Show>
  );
}

export default Icon;
