import React from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";

const VARIANTS = {
  create: {
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    confirmBtn: "bg-teal-600 hover:bg-teal-700",
  },
  update: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    confirmBtn: "bg-indigo-600 hover:bg-indigo-700",
  },
};

/**
 * Reusable confirmation dialog for non-destructive CRUD actions
 * (create / update). For delete, use ConfirmDeleteDialog instead.
 */
const ConfirmActionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmLabel = "Confirm",
  loadingLabel = "Saving...",
  loading = false,
  variant = "create",
}) => {
  if (!isOpen) return null;

  const style = VARIANTS[variant] || VARIANTS.create;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-md transform transition-all border border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 ${style.iconBg} rounded-full flex-shrink-0`}>
            <HelpCircle className={`${style.iconColor} w-6 h-6`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
            {details && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                {details}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all disabled:opacity-50 ${style.confirmBtn}`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmActionDialog;
