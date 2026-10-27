import React from 'react';
import { RefreshCcw, Home } from 'lucide-react';
import { languageService } from '../services/languageService';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      lang: languageService.getLang()
    };
    this.unsubscribeLang = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Notify user via toast event so they are immediately aware
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karmphal:toast', {
        detail: {
          type: 'error',
          title: 'ॐ शान्ति - कुछ त्रुटि हुई',
          message: error?.message || 'अपेक्षित घटक में त्रुटि उत्पन्न हुई।'
        }
      }));
    }
  }

  componentDidMount() {
    this.unsubscribeLang = languageService.subscribe((newLang) => {
      this.setState({ lang: newLang });
    });

    // If this is the root global error boundary, register global window event listeners
    if (this.props.isGlobal && typeof window !== 'undefined') {
      this.handleGlobalError = (event) => {
        const message = event?.message || 'अज्ञात प्रणाली त्रुटि (System Error)';
        window.dispatchEvent(new CustomEvent('karmphal:toast', {
          detail: {
            type: 'error',
            title: 'ॐ शान्ति - कुछ त्रुटि हुई',
            message
          }
        }));
      };

      this.handleUnhandledRejection = (event) => {
        const reason = event?.reason?.message || (typeof event?.reason === 'string' ? event.reason : 'अज्ञात नेटवर्क/प्रणाली त्रुटि');
        window.dispatchEvent(new CustomEvent('karmphal:toast', {
          detail: {
            type: 'error',
            title: 'ॐ शान्ति - नेटवर्क सम्प्रेषण त्रुटि',
            message: reason
          }
        }));
      };

      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeLang) {
      this.unsubscribeLang();
    }
    if (this.props.isGlobal && typeof window !== 'undefined') {
      if (this.handleGlobalError) {
        window.removeEventListener('error', this.handleGlobalError);
      }
      if (this.handleUnhandledRejection) {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isEnglish = this.state.lang === 'en';
    const isSanskrit = this.state.lang === 'sa';

    const title = isEnglish
      ? 'Om Shanti - An Unexpected Issue Occurred'
      : isSanskrit
        ? 'ॐ शान्तिः - काचित् त्रुटिः सञ्जाता'
        : 'ॐ शान्ति - कुछ त्रुटि हुई';

    const subtitle = isEnglish
      ? (this.props.section
          ? `The ${this.props.section} section encountered a transient issue. Other sections remain fully operational.`
          : 'An unexpected state occurred. Your sadhana progress remains safely cached on this device.')
      : isSanskrit
        ? 'घटके त्रुटिः सञ्जाता। भवतः साधना-विवरणं सुरक्षितम् अस्ति।'
        : (this.props.section
            ? `इस विभाग में अप्रत्याशित समस्या उत्पन्न हुई। अन्य सभी अनुभाग सामान्य रूप से कार्यरत हैं।`
            : 'प्रणाली में क्षणिक अवरोध आया है। आपका समस्त साधना व जप डेटा सुरक्षित है।');

    const retryText = isEnglish ? 'Retry / Refresh' : isSanskrit ? 'पुनः प्रयतताम्' : 'पुनः प्रयास करें';
    const goHomeText = isEnglish ? 'Go Home' : isSanskrit ? 'मुख्य-पृष्ठम्' : 'मुख्य पृष्ठ (होम)';
    const detailsText = isEnglish ? 'Details:' : isSanskrit ? 'विवरणम्:' : 'विवरण:';
    const sectionIsolationText = isEnglish ? 'SECTION ISOLATION' : isSanskrit ? 'अनुभाग-विलगनम्' : 'अनुभाग विलगन';

    // Section-level fallback: compact in-place card
    if (this.props.section) {
      return (
        <div 
          className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C58B4E]/40 shadow-2xl bg-[#140B06]/95 text-[#F7E7D6] my-4 max-w-2xl mx-auto animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] font-black text-xl shadow-lg border border-[#F3CA9D]">
              ॐ
            </div>
            <div>
              <h2 className="font-dharmik text-lg sm:text-xl font-bold text-[#F3CA9D]">
                {title}
              </h2>
              <span className="text-xs text-[#D4A373]/80">
                {this.props.section.toUpperCase()} {sectionIsolationText}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#E6CCB2] leading-relaxed mb-6">
            {subtitle}
          </p>

          {this.state.error?.message && (
            <div className="p-3 mb-6 rounded-xl bg-black/50 border border-[#8C5318]/40 text-xs text-[#D4A373] font-mono break-words">
              <span className="text-[#E0A96D] font-bold">{detailsText}</span> {this.state.error.message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C58B4E] to-[#8C5318] text-[#120A05] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              {retryText}
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-5 py-2.5 rounded-xl bg-black/60 border border-[#C58B4E]/40 text-[#F7E7D6] font-semibold text-sm hover:border-[#E0A96D] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              {goHomeText}
            </button>
          </div>
        </div>
      );
    }

    // Global App-level fallback: full screen
    return (
      <div 
        className="min-h-screen bg-[#0C0603] text-[#FEF3E2] flex items-center justify-center p-4 selection:bg-[#C58B4E]/30"
        role="alert"
        aria-live="assertive"
      >
        <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-[#C58B4E]/50 shadow-2xl bg-[#140B06]/95 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E0A96D] via-[#C58B4E] to-[#6A3B18] flex items-center justify-center text-[#120A05] font-black text-3xl shadow-xl border border-[#F3CA9D]">
            ॐ
          </div>

          <h1 className="font-dharmik text-xl sm:text-2xl font-bold text-[#F3CA9D] mb-2">
            {title}
          </h1>

          <p className="text-sm text-[#E6CCB2] leading-relaxed mb-6">
            {subtitle}
          </p>

          {this.state.error?.message && (
            <div className="p-3 mb-6 rounded-xl bg-black/60 border border-[#8C5318]/40 text-xs text-[#D4A373] font-mono text-left break-words">
              <span className="text-[#E0A96D] font-bold">{detailsText}</span> {this.state.error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#C58B4E] to-[#8C5318] text-[#120A05] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              {retryText}
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black/60 border border-[#C58B4E]/40 text-[#F7E7D6] font-semibold text-sm hover:border-[#E0A96D] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              {goHomeText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
