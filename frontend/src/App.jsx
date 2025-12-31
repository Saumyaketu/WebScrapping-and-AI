import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaExternalLinkAlt, FaPenNib, FaCopy, FaCheck, FaBookOpen, FaMagic } from 'react-icons/fa';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch articles on load
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL)
      .then(response => {
        setArticles(response.data);
        if (response.data.length > 0) setSelectedArticle(response.data[0]);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // Copy to Clipboard Function
  const handleCopy = () => {
    if (!selectedArticle?.updated_content) return;
    
    // Create a temporary element to copy the HTML text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = selectedArticle.updated_content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-8">
      
      {/* HEADER */}
      <header className="mb-10 text-center space-y-2 max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                <FaMagic size={20} />
            </span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Content AI Improver</h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base font-medium">
          Automated Research • Competitor Analysis • Content Enhancement
        </p>
      </header>

      {/* DASHBOARD CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-400 h-[80vh]">
        
        {/* SIDEBAR: ARTICLE LIST */}
        <div className="lg:w-80 shrink-0 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-indigo-100/50 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FaBookOpen /> Your Library
            </h2>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
            {articles.map(article => (
              <div 
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                  selectedArticle?.id === article.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent transform scale-[1.02]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="relative z-10">
                  <h3 className={`font-semibold text-sm leading-snug mb-2 line-clamp-2 ${
                    selectedArticle?.id === article.id ? 'text-white' : 'text-slate-700'
                  }`}>
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                        article.is_processed 
                        ? (selectedArticle?.id === article.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700')
                        : (selectedArticle?.id === article.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700')
                    }`}>
                        {article.is_processed ? 'Enhanced' : 'Pending'}
                    </span>
                    <span className={`text-[10px] opacity-60 ${selectedArticle?.id === article.id ? 'text-white' : 'text-slate-400'}`}>
                        ID: {article.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        {selectedArticle ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* ORIGINAL CONTENT CARD */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FaPenNib className="text-slate-400" /> Original Draft
                </span>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                <article className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600">
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.original_content }} />
                </article>
              </div>
            </div>

            {/* ENHANCED CONTENT CARD */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-100 flex flex-col overflow-hidden relative animate-fade-in" style={{animationDelay: '0.1s'}}>
              
              {/* Header */}
              <div className="p-4 border-b border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                    <FaRobot className="text-indigo-500" /> AI Enhanced Version
                </span>
                
                {selectedArticle.updated_content && (
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {copied ? <FaCheck /> : <FaCopy />}
                        {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                )}
              </div>

              {/* Content Body */}
              <div className="p-8 overflow-y-auto flex-1 bg-linear-to-b from-white to-indigo-50/10">
                {selectedArticle.updated_content ? (
                  <article className="prose prose-sm prose-indigo max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600">
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.updated_content }} />
                  </article>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                        <FaRobot size={24} className="text-slate-300" />
                     </div>
                     <p className="text-sm font-medium">Waiting for AI processing...</p>
                   </div>
                )}
              </div>
              
              {/* Footer / References */}
              {selectedArticle.reference_links && selectedArticle.reference_links.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs">
                  <div className="font-semibold text-slate-500 mb-2 uppercase tracking-wider text-[10px]">Sources Analyzed</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.reference_links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                      >
                        <span className="truncate max-w-37.5">{new URL(link).hostname.replace('www.', '')}</span>
                        <FaExternalLinkAlt size={8} className="opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                <div className="text-center">
                    <FaBookOpen size={40} className="mx-auto mb-4 opacity-20" />
                    <p>Select an article from the library to begin</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;