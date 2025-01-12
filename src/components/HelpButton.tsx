'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

export function HelpButton() {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-32 z-50 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 shadow-lg hover:bg-white/95 transition-colors cursor-pointer"
      >
        {t('help').button}
      </button>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t('help').title}
            </h2>

            <div className="space-y-6">
              {t('help').steps.map((step: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('help').tipsTitle}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t('help').tips.map((tip: string, index: number) => (
                  <li key={index} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-8 w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition duration-200 font-medium"
            >
              {t('help').close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
