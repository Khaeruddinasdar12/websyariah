import React from "react";
import { renderIcon, type IconInput } from "@/utils/renderIcon";

interface IconProps {
  icon: IconInput;
  className?: string;
}

export default function Icon({ icon, className }: IconProps) {
  return renderIcon(icon, className);
}
