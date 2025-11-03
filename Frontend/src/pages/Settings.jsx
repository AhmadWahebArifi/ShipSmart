import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import { 
  HiCog6Tooth, 
  HiLanguage, 
  HiCheck
} from 'react-icons/hi2';

function Settings() {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'prs', name: 'Dari', nativeName: 'دری', flag: '🇦🇫' },
    { code: 'pbt', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫' }
  ];

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={toggleSidebar} isDark={isDark} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen || !sidebarCollapsed ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <HiCog6Tooth className="w-6 h-6" />
              </div>
              <h1 className={`text-3xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {t('settings.title')}
              </h1>
            </div>
            <p className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('settings.managePreferences')}
            </p>
          </div>

          {/* Language Settings Card */}
          <div className={`rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <HiLanguage className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {t('settings.language')}
                </h2>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('settings.languageDescription')}
                </p>
              </div>
            </div>

            {/* Language Options */}
            <div className="space-y-3">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : isDark
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold">{lang.nativeName}</p>
                        <p className={`text-xs ${
                          isSelected
                            ? 'text-white/80'
                            : isDark
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}>
                          {lang.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className={`p-1 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-white/20'
                          : isDark
                          ? 'bg-gray-600'
                          : 'bg-gray-200'
                      }`}>
                        <HiCheck className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Settings Placeholder */}
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {t('settings.moreSettings')}
            </h3>
            <p className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('settings.additionalSettingsComingSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

