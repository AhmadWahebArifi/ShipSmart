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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Perform login immediately but don't navigate yet
    const result = await login(email, password);

    // Show loader for exactly 5 seconds total
    showLoaderWithText("ShipSmart", 5000);

    setTimeout(() => {
      setLoading(false);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    }, 5000);
  };

  return (
    <>
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
        }`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isDark
              ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <HiSun className="w-6 h-6" />
          ) : (
            <HiMoon className="w-6 h-6" />
          )}
        </button>

        <div
          className={`w-full max-w-md px-6 py-8 transition-all duration-300 ${
            isDark
              ? "bg-gray-800/90 backdrop-blur-lg border border-gray-700"
              : "bg-white/90 backdrop-blur-lg border border-gray-200"
          } rounded-2xl shadow-2xl`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${
                isDark
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <HiTruck className="w-10 h-10" />
            </div>
            <h1
              className={`text-4xl font-bold mb-2 transition-colors ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t("app.name")}
            </h1>
            <p
              className={`text-sm transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("login.title")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 transition-colors ${
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
                  <HiEnvelope className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 ${
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
                className={`block text-sm font-medium mb-2 transition-colors ${
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
                  <HiLockClosed className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-300 ${
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
                    <HiEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform ${
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
                    className="animate-spin h-5 w-5"
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
            className={`mt-8 text-center text-sm transition-colors ${
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
            className={`mt-6 p-3 rounded-lg text-xs text-center transition-colors ${
              isDark
                ? "bg-blue-900/20 text-blue-400 border border-blue-800/50"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <p className="font-medium">{t("login.testCredentials")}:</p>
            <p className="mt-1">{t("login.testEmail")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
