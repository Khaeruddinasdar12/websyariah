"use client";

import React from "react";
import { PencilIcon, TrashBinIcon } from "@/icons";
import Icon from "@/components/ui/icon/Icon";

interface AdminTableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export default function AdminTableActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Hapus",
}: AdminTableActionsProps) {
  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors min-w-[32px] min-h-[32px]"
        title={editLabel}
        aria-label={editLabel}
      >
        <Icon icon={PencilIcon} className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors min-w-[32px] min-h-[32px]"
        title={deleteLabel}
        aria-label={deleteLabel}
      >
        <Icon icon={TrashBinIcon} className="w-4 h-4" />
      </button>
    </div>
  );
}
