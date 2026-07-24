import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Phone,
  MapPin,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  Hash,
} from "lucide-react";

const UserManagementViewModal = ({ isOpen, onClose, employee }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const isActive = employee.status === "Active";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
          <div>
            <h2 className="text-lg font-bold text-white">Employee Details</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              View-only information • {employee.emp_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {employee.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      @{employee.login_id}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {isActive ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  {employee.status}
                </div>
              </div>

              {/* Employee ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Employee ID
                    </p>
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    {employee.emp_id}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Designation
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold ${
                      employee.designation?.toLowerCase() === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {employee.designation}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Contact Information
              </h4>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {employee.phone_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Location Details
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Location
                  </p>
                  {employee.is_online ? (
                    <p className="text-sm font-medium text-gray-900">
                      {employee.location || "Not set"}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Offline
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info (if available) */}
            {(employee.created_at || employee.updated_at) && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Record Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.created_at && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Created On
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(employee.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                  {employee.updated_at && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(employee.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UserManagementViewModal;
