import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ConfirmActionDialog from "./ConfirmActionDialog";
import userManagementService from "../../services/userManagementService";

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: "Weak", color: "bg-red-500", textColor: "text-red-600" };
    if (strength <= 3) return { level: 2, text: "Fair", color: "bg-yellow-500", textColor: "text-yellow-600" };
    if (strength <= 4) return { level: 3, text: "Good", color: "bg-teal-500", textColor: "text-teal-600" };
    return { level: 4, text: "Strong", color: "bg-green-500", textColor: "text-green-600" };
  };

  const strength = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">Password Strength</span>
        <span className={`text-xs font-bold ${strength.textColor}`}>{strength.text}</span>
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

const UpdatePasswordModal = ({ isOpen, onClose, employee }) => {
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setPwd1("");
      setPwd2("");
      setError("");
      setSuccess(false);
      setConfirmOpen(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validate = () => {
    if (!pwd1) return "Password is required";
    if (pwd1.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(pwd1) || !/[A-Z]/.test(pwd1) || !/[0-9]/.test(pwd1)) {
      return "Password must contain upper, lower case letters and a number";
    }
    if (pwd1 !== pwd2) return "Passwords do not match";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await userManagementService.updateEmployee(employee.emp_id, { password: pwd1 });
      setSuccess(true);
      setPwd1("");
      setPwd2("");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="relative bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 border-b border-indigo-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Update Password</h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                {employee?.name} • {employee?.emp_id}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle size={32} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Password Updated Successfully
            </h3>
            <p className="text-sm text-gray-500">
              {employee?.name}'s password has been reset.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd1 ? "text" : "password"}
                    value={pwd1}
                    onChange={(e) => {
                      setPwd1(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    autoFocus
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd1((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600"
                  >
                    {showPwd1 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={pwd1} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd2 ? "text" : "password"}
                    value={pwd2}
                    onChange={(e) => {
                      setPwd2(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600"
                  >
                    {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-white">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Update Password
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        variant="update"
        title="Confirm Password Update"
        message={`You are about to reset the password for ${employee?.name} (${employee?.emp_id}).`}
        confirmLabel="Update Password"
        loadingLabel="Updating..."
        loading={saving}
      />
    </div>,
    document.body,
  );
};

export default UpdatePasswordModal;
