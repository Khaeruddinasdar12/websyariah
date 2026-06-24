import React from "react";

type IconInput =
  | React.ComponentType<React.SVGProps<SVGSVGElement>>
  | React.ReactElement
  | string
  | null
  | undefined
  | Record<string, unknown>;

export type { IconInput };

function resolveIconComponent(
  IconComponent: IconInput
): React.ComponentType<React.SVGProps<SVGSVGElement>> | null {
  if (!IconComponent) return null;

  if (React.isValidElement(IconComponent)) {
    return null;
  }

  if (typeof IconComponent === "string") {
    return null;
  }

  let component: unknown = IconComponent;

  if (typeof component === "object" && component !== null) {
    const mod = component as Record<string, unknown>;
    if (typeof mod.default === "function") {
      component = mod.default;
    } else if (typeof mod.ReactComponent === "function") {
      component = mod.ReactComponent;
    }
  }

  if (typeof component === "function") {
    return component as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }

  return null;
}

const defaultSvgProps = (className?: string): React.SVGProps<SVGSVGElement> => ({
  className: className || "",
  width: "1em",
  height: "1em",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: "false",
});

/**
 * Safely render SVG icons from @svgr/webpack / Turbopack SVGR loader.
 */
export function renderIcon(
  IconComponent: IconInput,
  className?: string
): React.ReactElement {
  if (React.isValidElement(IconComponent)) {
    return IconComponent;
  }

  if (typeof IconComponent === "string") {
    return (
      <img
        src={IconComponent}
        className={className || ""}
        alt=""
        aria-hidden
      />
    );
  }

  const Component = resolveIconComponent(IconComponent);

  if (Component) {
    return React.createElement(Component, defaultSvgProps(className));
  }

  return (
    <svg
      {...defaultSvgProps(className)}
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}
