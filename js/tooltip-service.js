(function (global) {
  if (!global.App) global.App = {};
  var App = global.App;

  App.TooltipService = (function () {
    var tooltip = null;
    var visibleClass = "visible";

    function create() {
      tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      document.body.appendChild(tooltip);
    }

    function show(target, text) {
      if (!target) return;
      if (!tooltip) create();

      // Content
      tooltip.textContent = text || target.getAttribute("data-tooltip") || "";
      // Start hidden to measure correctly
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateY(10px)";
      tooltip.classList.add(visibleClass);

      // Measure
      var rect = target.getBoundingClientRect();
      var ttRect = tooltip.getBoundingClientRect();

      // Positioning: desktop above, mobile below
      var desktop = window.innerWidth > 768;
      var desiredTop = desktop
        ? rect.top - ttRect.height - 10
        : rect.bottom + 10;
      var desiredLeft = rect.left + rect.width / 2 - ttRect.width / 2;

      // Constrain to viewport
      var pad = 8;
      var left = Math.max(
        pad,
        Math.min(desiredLeft, window.innerWidth - ttRect.width - pad)
      );
      var top = Math.max(
        pad,
        Math.min(desiredTop, window.innerHeight - ttRect.height - pad)
      );

      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";

      // Reveal
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateY(0)";
    }

    function hide() {
      if (!tooltip) return;
      tooltip.classList.remove(visibleClass);
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateY(10px)";
    }

    function bindAll(root) {
      var ctx = root || document;
      var nodes = ctx.querySelectorAll("[data-tooltip]");
      for (var i = 0; i < nodes.length; i++) {
        (function (el) {
          el.addEventListener("mouseenter", function () {
            show(el);
          });
          el.addEventListener("mouseleave", hide);
          el.addEventListener(
            "focus",
            function () {
              show(el);
            },
            true
          );
          el.addEventListener("blur", hide, true);
          // Touch support (brief preview)
          el.addEventListener(
            "touchstart",
            function () {
              show(el);
            },
            { passive: true }
          );
          el.addEventListener("touchend", hide, { passive: true });
        })(nodes[i]);
      }
    }

    return { show: show, hide: hide, bindAll: bindAll };
  })();
})(window);
