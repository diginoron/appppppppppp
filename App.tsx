import React, { useState, useCallback } from 'react'; // Removed useEffect as it's no longer needed for initial API key check
import { generateThesisTopics } from './services/geminiService';
import { ThesisTopic } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import TopicCard from './components/TopicCard';
import { DEFAULT_KEYWORDS_PLACEHOLDER } from './constants';

const App: React.FC = () => {
  const [keywords, setKeywords] = useState<string>('');
  const [topics, setTopics] = useState<ThesisTopic[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Assume API_KEY is available via process.env initially.
  // We only show the prompt if an API call fails with a key-related error.
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [showApiKeySelectionPrompt, setShowApiKeySelectionPrompt] = useState<boolean>(false);

  const handleKeywordsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeywords(e.target.value);
  }, []);

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful to mitigate race condition
        setHasApiKey(true);
        setShowApiKeySelectionPrompt(false);
        setError(null); // Clear any previous API key errors
      } catch (e) {
        console.error('Error opening API key selection dialog:', e);
        setError('خطا در باز کردن پنجره انتخاب کلید API.');
      }
    } else {
      setError('امکان انتخاب کلید API در این محیط وجود ندارد. لطفاً از طریق تنظیمات کلید را فراهم کنید.');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // No initial check for hasApiKey here; we attempt to use process.env.API_KEY.
    // Error handling will catch if it's invalid/missing and then prompt.

    if (!keywords.trim()) {
      setError('لطفا حداقل یک کلیدواژه وارد کنید.');
      setTopics(null);
      return;
    }

    setLoading(true);
    setError(null);
    setTopics(null);

    try {
      const response = await generateThesisTopics(keywords);
      setTopics(response.topics);
    } catch (err: any) {
      console.error('Failed to fetch topics:', err);
      const errorMessage = err.message || '';
      // Check for specific error message to re-prompt API key selection
      if (errorMessage.includes('Rpc failed due to xhr error') || errorMessage.includes('Requested entity was not found.')) {
        setError('خطا در ارتباط با هوش مصنوعی. لطفاً کلید API خود را بررسی و مجدداً انتخاب کنید.');
        setHasApiKey(false); // Mark API key as invalid
        setShowApiKeySelectionPrompt(true); // Show the prompt
      } else {
        setError(errorMessage || 'خطا در دریافت موضوعات. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  }, [keywords]); // hasApiKey is no longer a direct dependency here for submission logic

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-right flex flex-col items-center">
      <header className="w-full max-w-4xl text-center py-6 mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow-sm leading-tight">
          پیشنهاد موضوع پایان‌نامه با هوش مصنوعی
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          کلیدواژه‌های خود را وارد کنید تا هوش مصنوعی چندین موضوع جذاب و مرتبط برای پایان‌نامه شما پیشنهاد دهد.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 space-y-8">
        {showApiKeySelectionPrompt && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6" role="alert">
            <p className="font-bold">کلید API نیاز است!</p>
            <p className="mt-2">
              برای استفاده از این برنامه، یک کلید API گوگل جیمینی نیاز است. لطفاً روی دکمه زیر کلیک کنید.
            </p>
            <p className="mt-2 text-sm">
              برای اطلاعات بیشتر در مورد صورت‌حساب، به{' '}
              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-700 underline hover:text-yellow-900"
              >
                مستندات صورت‌حساب
              </a>{' '}
              مراجعه کنید.
            </p>
            <button
              onClick={handleSelectApiKey}
              className="mt-4 px-6 py-2 bg-yellow-600 text-white font-bold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              انتخاب کلید API
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ display: showApiKeySelectionPrompt ? 'none' : 'block' }}>
          <div>
            <label htmlFor="keywords" className="block text-lg font-medium text-gray-700 mb-2">
              کلیدواژه‌های اصلی پایان‌نامه شما:
            </label>
            <textarea
              id="keywords"
              rows={4}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base placeholder-gray-400 resize-y"
              placeholder={DEFAULT_KEYWORDS_PLACEHOLDER}
              value={keywords}
              onChange={handleKeywordsChange}
              disabled={loading} // Only disable based on loading state, not initial API key presence
            ></textarea>
            <p className="mt-2 text-sm text-gray-500">
              چندین کلیدواژه مرتبط با حوزه تحقیقاتی خود را با کاما از هم جدا کنید.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !keywords.trim()} // Disable if loading or keywords are empty
          >
            {loading ? (
              <>
                <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال پردازش...
              </>
            ) : (
              'تولید موضوعات پایان‌نامه'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">خطا: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {topics && topics.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">موضوعات پیشنهادی:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic, index) => (
                <TopicCard key={index} topic={topic} />
              ))}
            </div>
          </div>
        )}

        {topics && topics.length === 0 && !loading && !showApiKeySelectionPrompt && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative text-center">
                <strong className="font-bold">هیچ موضوعی یافت نشد!</strong>
                <span className="block sm:inline"> لطفاً با کلیدواژه‌های متفاوت دوباره تلاش کنید.</span>
            </div>
        )}
      </main>

      <footer className="w-full max-w-4xl text-center py-6 mt-8 text-gray-500 text-sm">
        <p>
          ساخته شده با ❤️ و هوش مصنوعی. قدرت گرفته از Google Gemini API.
        </p>
      </footer>
    </div>
  );
};

export default App;