import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, AlertCircle, KeyRound } from "lucide-react";
import ConfirmActionDialog from "./ConfirmActionDialog";
import UpdatePasswordModal from "./UpdatePasswordModal";

const UserManagementEditModal = ({ isOpen, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    login_id: "",
    location: "",
    designation: "",
    status: "Active",
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        phone_number: employee.phone_number || "",
        login_id: employee.login_id || "",
        location: employee.location || "",
        designation: employee.designation || "",
        status: employee.status || "Active",
      });
      setErrors({});
      setPasswordModalOpen(false);
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowConfirm(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [employee, isOpen]);

  const validatePhoneNumber = (phone) => {
    if (!phone?.trim()) {
      return "Phone number is required";
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      return "Phone number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, any> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.designation?.trim()) {
      newErrors.designation = "Designation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      const sanitized = value.replace(/[^\d]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      const error = validatePhoneNumber(sanitized);
      setErrors((prev) => ({ ...prev, phone_number: error || "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      const payload =
        formData.designation === "Admin"
          ? { ...formData, status: "Active" }
          : formData;
      await onSave(employee.emp_id, payload);
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = Object.keys(errors).length === 0;

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
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 border-b border-indigo-700">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Employee</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Update employee information • {employee?.emp_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID (Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employee?.emp_id || ""}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                      : "bg-white border-slate-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="Enter employee name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Login ID (Read-only, auto-assigned) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Login ID
                </label>
                <input
                  type="text"
                  value={formData.login_id}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                    errors.phone_number
                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                      : "bg-white border-slate-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="9876543210"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone_number}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  10-digit Indian mobile number
                </p>
              </div>

              {/* Password — opens a dedicated modal, separate from Save Changes */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Update Password
                </button>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                    errors.location
                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                      : "bg-white border-slate-300 focus:ring-indigo-500/20"
                  }`}
                >
                  <option value="">Select Location</option>
                  <option value="Gate 1">Gate 1</option>
                  <option value="Gate 2">Gate 2</option>
                </select>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                    errors.designation
                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                      : "bg-white border-slate-300 focus:ring-indigo-500/20"
                  }`}
                >
                  <option value="">Select Designation</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.designation && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.designation}
                  </p>
                )}
              </div>

              {/* Status — admins can't deactivate an Admin account */}
              {formData.designation === "Admin" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600">
                    Active (Admin accounts can't be deactivated)
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isFormValid}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmActionDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        variant="update"
        title="Confirm Changes"
        message={`You are about to update the account for ${employee?.emp_id}.`}
        confirmLabel="Save Changes"
        loadingLabel="Saving..."
        details={
          <>
            <p className="text-sm">
              <span className="text-gray-500">Name:</span>{" "}
              <span className="font-semibold text-gray-900">
                {formData.name}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Status:</span>{" "}
              <span className="font-semibold text-gray-900">
                {formData.status}
              </span>
            </p>
          </>
        }
      />

      <UpdatePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        employee={employee}
      />
    </div>,
    document.body,
  );
};

export default UserManagementEditModal;
