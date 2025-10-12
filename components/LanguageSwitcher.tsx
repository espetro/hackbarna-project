"use client";

import { useState } from "react";

const locales = ["en", "es", "ca"];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: string) => {
    document.cookie = `lingo-locale: ${locale}`;
    window.location.reload();
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md"
      >
        🔄
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
          <ul className="py-1">
            {locales.map((locale) => (
              <li
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {locale.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default LanguageSwitcher;
