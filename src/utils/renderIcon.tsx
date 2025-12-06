import React from 'react';

/**
 * Helper function to safely render SVG icons from @svgr/webpack
 * Handles different export formats and ensures icons are rendered as React components
 */
export function renderIcon(
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>> | any,
  className?: string
): React.ReactElement | null {
  if (!IconComponent) {
    return null;
  }

  // Handle different export formats from @svgr/webpack
  let Component = IconComponent;
  
  // Check if it has a default export (common with @svgr/webpack)
  if (IconComponent && typeof IconComponent === 'object' && 'default' in IconComponent) {
    Component = (IconComponent as any).default;
  }

  // Check if it's a valid React component (function)
  if (typeof Component === 'function') {
    try {
      const props: React.SVGProps<SVGSVGElement> = {
        className: className || "",
        width: "1em",
        height: "1em",
        fill: "currentColor",
      };
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Error rendering icon:', error, IconComponent);
      // Fallback: try JSX syntax
      try {
        const Icon = Component as React.ComponentType<React.SVGProps<SVGSVGElement>>;
        return <Icon className={className || ""} width="1em" height="1em" fill="currentColor" />;
      } catch (jsxError) {
        console.error('Error rendering icon (JSX fallback):', jsxError);
        return null;
      }
    }
  }

  // Fallback: try to render as JSX if it's already a valid element
  if (React.isValidElement(Component)) {
    return Component;
  }

  return null;
}

