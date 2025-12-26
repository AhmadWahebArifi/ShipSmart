import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLoader } from "../context/LoaderContext";
import {
  HiTruck,
  HiEnvelope,
  HiLockClosed,
  HiSun,
  HiMoon,
  HiEye,
  HiEyeSlash,
} from "react-icons/hi2";

function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showLoaderWithText } = useLoader();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState(""); // New: to categorize errors
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorType("");
    setLoading(true);

    // Client-side validation
    if (!email.trim()) {
      setError("Email is required");
      setErrorType("validation");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      setErrorType("validation");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Please enter a valid email address");
      setErrorType("validation");
      setLoading(false);
      return;
    }

    // Perform login
    const result = await login(email, password);

    // Show loader for exactly 5 seconds total
    showLoaderWithText("ShipSmart", 5000);

    setTimeout(() => {
      setLoading(false);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
        setErrorType(getErrorType(result.message));
      }
    }, 5000);
  };

  // Helper function to categorize error types
  const getErrorType = (errorMessage) => {
    if (!errorMessage) return "unknown";
    
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes("invalid email") || lowerMessage.includes("user not found")) {
      return "credentials";
    } else if (lowerMessage.includes("invalid password") || lowerMessage.includes("password")) {
      return "credentials";
    } else if (lowerMessage.includes("network") || lowerMessage.includes("connect") || lowerMessage.includes("server")) {
      return "network";
    } else if (lowerMessage.includes("validation") || lowerMessage.includes("required") || lowerMessage.includes("email")) {
      return "validation";
    } else if (lowerMessage.includes("database") || lowerMessage.includes("sql")) {
      return "database";
    } else {
      return "general";
    }
  };

  return (
    <>
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
        }`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`fixed top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isDark
              ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <HiSun className="w-4 h-4 sm:w-6 sm:h-6" />
          ) : (
            <HiMoon className="w-4 h-4 sm:w-6 sm:h-6" />
          )}
        </button>

        <div
          className={`w-full max-w-md px-4 sm:px-6 py-6 sm:py-8 transition-all duration-300 ${
            isDark
              ? "bg-gray-800/90 backdrop-blur-lg border border-gray-700"
              : "bg-white/90 backdrop-blur-lg border border-gray-200"
          } rounded-2xl shadow-2xl`}
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 transition-all duration-300 ${
                isDark
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <HiTruck className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t("app.name")}
            </h1>
            <p
              className={`text-xs sm:text-sm transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("login.title")}
            </p>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border transition-all duration-300 ${
                errorType === 'network' 
                  ? isDark 
                    ? "bg-orange-900/30 border-orange-700 text-orange-300"
                    : "bg-orange-50 border-orange-200 text-orange-700"
                : errorType === 'validation'
                  ? isDark
                    ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
                    : "bg-yellow-50 border-yellow-200 text-yellow-700"
                : errorType === 'database'
                  ? isDark
                    ? "bg-purple-900/30 border-purple-700 text-purple-300"
                    : "bg-purple-50 border-purple-200 text-purple-700"
                  : isDark
                    ? "bg-red-900/30 border-red-700 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {errorType === 'network' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {errorType === 'validation' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {errorType === 'database' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(errorType === 'credentials' || errorType === 'general' || errorType === 'unknown') && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1 text-sm sm:text-base">
                    {errorType === 'network' && 'Connection Error'}
                    {errorType === 'validation' && 'Validation Error'}
                    {errorType === 'database' && 'Database Error'}
                    {errorType === 'credentials' && 'Authentication Error'}
                    {(errorType === 'general' || errorType === 'unknown') && 'Login Error'}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">{error}</div>
                  
                  {/* Helpful suggestions based on error type */}
                  {errorType === 'network' && (
                    <div className="mt-2 text-xs opacity-80">
                      <p>• Check if the backend server is running on http://localhost:5000</p>
                      <p>• Verify your internet connection</p>
                      <p>• Try refreshing the page</p>
                    </div>
                  )}
                  {errorType === 'credentials' && (
                    <div className="mt-2 text-xs opacity-80">
                      <p>• Double-check your email and password</p>
                      <p>• Make sure Caps Lock is off</p>
                      <p>• Contact your administrator if you forgot your credentials</p>
                    </div>
                  )}
                  {errorType === 'validation' && (
                    <div className="mt-2 text-xs opacity-80">
                      <p>• Enter a valid email address</p>
                      <p>• Make sure all fields are filled</p>
                    </div>
                  )}
                  {errorType === 'database' && (
                    <div className="mt-2 text-xs opacity-80">
                      <p>• Database connection issue detected</p>
                      <p>• Contact your system administrator</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className={`block text-xs sm:text-sm font-medium mb-2 transition-colors ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("login.email")}
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <HiEnvelope className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border transition-all duration-300 text-sm ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  } focus:ring-2 focus:outline-none`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className={`block text-xs sm:text-sm font-medium mb-2 transition-colors ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("login.password")}
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <HiLockClosed className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border transition-all duration-300 text-sm ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  } focus:ring-2 focus:outline-none`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors`}
                >
                  {showPassword ? (
                    <HiEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 sm:py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform text-sm ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDark
                  ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("login.signingIn")}
                </span>
              ) : (
                t("login.signIn")
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            className={`mt-6 sm:mt-8 text-center text-xs sm:text-sm transition-colors ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <p>
              {t("login.noAccount")}{" "}
              <span className="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline font-medium transition-colors">
                {t("login.contactAdmin")}
              </span>
            </p>
          </div>

          {/* Default Credentials Hint */}
          <div
            className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg text-center transition-colors ${
              isDark
                ? "bg-blue-900/20 text-blue-400 border border-blue-800/50"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <p className="font-medium mb-2 text-xs sm:text-sm">{t("login.testCredentials")}:</p>
            <div className="space-y-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="font-semibold">Super Admin:</span>
                <span className="truncate">superadmin@shipsmart.com</span>
              </div>
              <div className="text-xs opacity-75">Password: SuperAdmin123!</div>
              <div className="mt-2 pt-2 border-t border-current/20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold">Admin:</span>
                  <span className="truncate">{t("login.testEmail")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
