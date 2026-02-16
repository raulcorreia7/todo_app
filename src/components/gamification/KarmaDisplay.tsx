import { createEffect, on, onCleanup } from "solid-js";
import { gamificationState } from "@/stores/gamificationStore";
import Icon from "@/components/base/Icon";

function KarmaDisplay() {
  let animationFrame: number | undefined;
  let displayValue = gamificationState.karmaPoints;

  createEffect(
    on(
      () => gamificationState.karmaPoints,
      (newPoints) => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        const startValue = displayValue;
        const endValue = newPoints;
        const diff = endValue - startValue;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          displayValue = Math.round(startValue + diff * easeOut);

          const el = document.querySelector(".karma-display__value");
          if (el) {
            el.textContent = displayValue.toString();
          }

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);
      }
    )
  );

  onCleanup(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  return (
    <div class="karma-display">
      <Icon name="sparkles" size={18} class="karma-display__icon" />
      <span class="karma-display__value">{gamificationState.karmaPoints}</span>
    </div>
  );
}

export default KarmaDisplay;
