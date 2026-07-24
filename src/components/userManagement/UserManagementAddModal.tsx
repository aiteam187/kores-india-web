import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  UserPlus,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import ConfirmActionDialog from "./ConfirmActionDialog";

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2)
      return {
        level: 1,
        text: "Weak",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    if (strength <= 3)
      return {
        level: 2,
        text: "Fair",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
      };
    if (strength <= 4)
      return {
        level: 3,
        text: "Good",
        color: "bg-teal-500",
        textColor: "text-teal-600",
      };
    return {
      level: 4,
      text: "Strong",
      color: "bg-green-500",
      textColor: "text-green-600",
    };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">
          Password Strength
        </span>
        <span className={`text-xs font-bold ${strength.textColor}`}>
          {strength.text}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              level <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const UserManagementAddModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    password: "",
    designation: "",
    status: "Active",
  });
  const [createdUser, setCreatedUser] = useState(null);

  const [errors, setErrors] = useState<Record<string, any>>({});
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [apiError, setApiError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setApiStatus("idle");
      setApiError("");
      setShowConfirm(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: "Password is required" };
    if (password.length < 8)
      return {
        isValid: false,
        message: "Password must be at least 8 characters",
      };
    if (!/[a-z]/.test(password))
      return {
        isValid: false,
        message: "Password must contain lowercase letters",
      };
    if (!/[A-Z]/.test(password))
      return {
        isValid: false,
        message: "Password must contain uppercase letters",
      };
    if (!/[0-9]/.test(password))
      return { isValid: false, message: "Password must contain numbers" };
    return { isValid: true };
  };

  const validateForm = () => {
    const newErrors: Record<string, any> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\s/g, ""))) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (!formData.designation?.trim()) {
      newErrors.designation = "Designation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number" && value !== "" && !/^\d+$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      password: "",
      designation: "",
      status: "Active",
    });
    setErrors({});
    setApiStatus("idle");
    setApiError("");
    setCreatedUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    setShowConfirm(false);
    setAdding(true);
    setApiStatus("loading");

    try {
      const created = await onAdd(formData);
      setCreatedUser(created || null);

      setApiStatus("success");
      setAdding(false);

      setTimeout(() => {
        resetForm();
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Error adding employee:", error);
      const errorMessage = error.message || "Failed to add employee";

      setApiError(errorMessage);
      setApiStatus("error");
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (apiStatus === "loading") return;
    resetForm();
    onClose();
  };

  const handleRetry = () => {
    setApiStatus("idle");
    setApiError("");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={apiStatus === "loading" ? undefined : handleClose}
      />

      <div
        className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-600 to-blue-600 border-b border-teal-700">
          <div>
            <h2 className="text-lg font-bold text-white">Add New Employee</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Create a new employee account
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={apiStatus === "loading"}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* LOADING STATE */}
        {apiStatus === "loading" && (
          <div className="p-12 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-semibold text-gray-500">
                Creating employee account...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {apiStatus === "success" && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
              <CheckCircle size={40} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Employee Added Successfully
            </h3>
            <p className="text-gray-500 mb-2 max-w-sm">
              The account for{" "}
              <span className="font-bold text-gray-900">
                {formData.name}
              </span>{" "}
              has been created and is now active.
            </p>
            {createdUser?.login_id && (
              <p className="text-sm text-gray-600">
                Login ID:{" "}
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {createdUser.login_id}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ERROR STATE */}
        {apiStatus === "error" && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-6">
              <AlertCircle size={40} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Add Employee
            </h3>
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm mb-8 max-w-sm">
              {apiError}
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg shadow-sm transition-all"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        )}

        {/* FORM STATE */}
        {apiStatus === "idle" && (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 bg-gray-50"
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        : "bg-white border-slate-300 focus:ring-teal-500/20"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                      errors.phone_number
                        ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                        : "bg-white border-slate-300 focus:ring-teal-500/20"
                    }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                          : "bg-white border-slate-300 focus:ring-teal-500/20"
                      }`}
                      placeholder="Create strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                  <PasswordStrengthIndicator password={formData.password} />
                </div>

                {/* Password Info */}
                <div className="md:col-span-2">
                  <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <span className="font-semibold">
                          Password must contain:
                        </span>{" "}
                        At least 8 characters, uppercase & lowercase letters,
                        and numbers. Login ID is auto-generated (e.g. 0001)
                        once the account is created.
                      </div>
                    </div>
                  </div>
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
                        : "bg-white border-slate-300 focus:ring-teal-500/20"
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

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    New employees are typically set to Active status
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        {apiStatus === "idle" && (
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleClose}
              disabled={adding}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={adding}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              {adding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Add Employee
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmAdd}
        variant="create"
        title="Confirm New Employee"
        message="You are about to create a new employee account with the details below."
        confirmLabel="Create Employee"
        loadingLabel="Creating..."
        details={
          <>
            <p className="text-sm">
              <span className="text-gray-500">Name:</span>{" "}
              <span className="font-semibold text-gray-900">
                {formData.name}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Phone:</span>{" "}
              <span className="font-semibold text-gray-900">
                {formData.phone_number}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Designation:</span>{" "}
              <span className="font-semibold text-gray-900">
                {formData.designation}
              </span>
            </p>
          </>
        }
      />
    </div>,
    document.body,
  );
};

export default UserManagementAddModal;
