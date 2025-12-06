import React from 'react';

/**
 * Helper function to safely render SVG icons from @svgr/webpack
 * Handles different export formats and ensures icons are rendered as React components
 */
export function renderIcon(
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>> | any,
  className?: string
): React.ReactElement {
  if (!IconComponent) {
    // Return empty SVG as fallback
    return (
      <svg className={className || ""} width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    );
  }

  // Handle different export formats from @svgr/webpack
  let Component = IconComponent;
  
  // Check if it has a default export (common with @svgr/webpack in production)
  if (IconComponent && typeof IconComponent === 'object') {
    if ('default' in IconComponent && IconComponent.default) {
      Component = IconComponent.default;
    } else if (IconComponent.__esModule && IconComponent.default) {
      Component = IconComponent.default;
    } else if (React.isValidElement(IconComponent)) {
      return IconComponent as React.ReactElement;
    }
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
      const element = React.createElement(Component, props);
      // Verify it's a valid React element
      if (React.isValidElement(element)) {
        return element;
      }
    } catch (error) {
      console.error('Error rendering icon with createElement:', error);
    }
    
    // Fallback: try JSX syntax
    try {
      const Icon = Component as React.ComponentType<React.SVGProps<SVGSVGElement>>;
      const jsxElement = <Icon className={className || ""} width="1em" height="1em" fill="currentColor" />;
      if (React.isValidElement(jsxElement)) {
        return jsxElement;
      }
    } catch (jsxError) {
      console.error('Error rendering icon with JSX:', jsxError);
    }
  }

  // Fallback: try to render as JSX if it's already a valid element
  if (React.isValidElement(Component)) {
    return Component as React.ReactElement;
  }

  // Final fallback: return empty SVG
  return (
    <svg className={className || ""} width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );
}

