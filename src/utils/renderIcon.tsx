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
  const Component = (IconComponent as any).default || IconComponent;

  // Check if it's a valid React component
  if (typeof Component === 'function') {
    return React.createElement(Component, { className: className || "" });
  }

  // Fallback: try to render as JSX if it's already a valid element
  if (React.isValidElement(Component)) {
    return Component;
  }

  return null;
}

