import type { JSX } from "solid-js";

interface AppContainerProps {
  children: JSX.Element;
}

export default function AppContainer(props: AppContainerProps) {
  return (
    <div class="app-container">
      {props.children}
    </div>
  );
}
