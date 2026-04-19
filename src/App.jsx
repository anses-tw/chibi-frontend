import React, { useState } from 'react';
import { 
  UploadCloud, Sparkles, Languages, Image as ImageIcon, 
  Download, RefreshCcw, CheckCircle2, 
  Terminal, ShieldAlert, Cpu, Palette, Users
} from 'lucide-react';

export default function CampusChibiGenerator() {
  // --- 前端狀態 (React State) ---
  const [step, setStep] = useState('selectGroup'); // selectGroup | upload | processing | preview
  const [groupId, setGroupId] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [promptData, setPromptData] = useState({ 
    chineseIdea: '', 
    englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' 
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [errorState, setErrorState] = useState(null);
  
  // UI 狀態
  const [isTranslating, setIsTranslating] = useState(false);
  const [logs, setLogs] = useState([]); // 教學用終端機日誌

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  // --- 核心操作流程 ---
  const handleGroupSelect = (id) => {
    setGroupId(id);
    setStep('upload');
    addLog(`使用者選擇了 第 ${id} 組，已綁定該組專屬 API Key 資源池。`, 'success');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      addLog(`照片上傳成功: ${file.name} (大小: ${(file.size/1024).toFixed(1)}KB)`, 'info');
    }
  };

  const handleTranslate = async () => {
  if (!promptData.chineseIdea) return;
  setIsTranslating(true);
  try {
    // ★ 注意：把 https://你的Render網址 換成你剛剛在 Render 拿到的真實網址！
    const response = await fetch('https://chibi-backend-q3xl.onrender.com/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: groupId, chineseIdea: promptData.chineseIdea })
    });
    const data = await response.json();
    setPromptData(prev => ({ ...prev, englishPrompt: data.englishPrompt }));
  } catch (err) {
    console.error(err);
  } finally {
    setIsTranslating(false);
  }
};

  const handleGenerate = async () => {
  setStep('processing');
  setErrorState(null);
  try {
    // ★ 注意：把 https://你的Render網址 換成你剛剛在 Render 拿到的真實網址！
    const response = await fetch('https://chibi-backend-q3xl.onrender.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: groupId, prompt: promptData.englishPrompt })
    });
    if (!response.ok) throw new Error("伺服器錯誤或額度滿載");
    const data = await response.json();
    setGeneratedImage(data.imageUrl); 
    setStep('preview');
  } catch (err) {
    setErrorState({ status: 429, message: err.message });
    setStep('upload');
  }
};

  const handleReset = () => {
    setStep('selectGroup');
    setGroupId(null);
    setSourceImage(null);
    setGeneratedImage(null);
    setPromptData({ chineseIdea: '', englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' });
    setErrorState(null);
    addLog(`[SYS] 系統已重置 (返回首頁)。`, 'info');
  };

  // --- 獨立區塊元件 ---

  // 1. 小組認證模組
  const renderGroupSelection = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-10">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-sky-500" />
          請選擇你的小組
        </h2>
        <p className="text-gray-500">系統將根據小組分配專屬的 API Key 資源池與流量限制</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            onClick={() => handleGroupSelect(id)}
            className="w-32 h-32 rounded-3xl bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-b-4 border-sky-100 flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-amber-300 text-white flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              {id}
            </div>
            <span className="font-semibold text-gray-600 group-hover:text-sky-500">第 {id} 組</span>
          </button>
        ))}
      </div>
    </div>
  );

  // 2. 提示詞魔法實驗室 (上傳與 Prompt)
  const renderUploadAndPrompt = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in w-full max-w-5xl">
      {/* 左側：上傳區 */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-sky-50 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ImageIcon className="w-6 h-6 text-sky-500" />
          1. 載入原始照片
        </h3>
        
        {!sourceImage ? (
          <label className="flex-1 border-4 border-dashed border-sky-100 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-sky-50 hover:border-sky-300 transition-colors bg-gray-50 min-h-[300px]">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-sky-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">點擊或拖曳上傳照片</p>
              <p className="text-sm text-gray-400 mt-1">支援 JPG, PNG 格式 (臉部需清晰)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-inner group min-h-[300px]">
            <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-amber-300 transition-colors">
                更換照片
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 右側：Prompt Lab */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-50 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-bl-full -z-0 opacity-20"></div>

        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 z-10">
          <Sparkles className="w-6 h-6 text-amber-500" />
          2. 提示詞魔法實驗室
        </h3>

        {/* 錯誤提示 */}
        {errorState && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 z-10 animate-shake">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800">魔法失敗</h4>
              <p className="text-sm text-red-600">{errorState.message}</p>
            </div>
          </div>
        )}

        <div className="space-y-4 flex-1 z-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              中文許願池 (Idea)
              <span className="text-xs font-normal text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">支援翻譯轉換</span>
            </label>
            <div className="flex gap-2">
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-amber-300 focus:outline-none resize-none h-24"
                placeholder="例如：穿著水手服，戴著貓耳，在操場微笑..."
                value={promptData.chineseIdea}
                onChange={(e) => setPromptData({...promptData, chineseIdea: e.target.value})}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {['水手服', '貓耳', '操場', '科幻', '魔法'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setPromptData(p => ({...p, chineseIdea: p.chineseIdea + (p.chineseIdea ? '，' : '') + tag}))}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-20">
            <button 
              onClick={handleTranslate}
              disabled={isTranslating || !promptData.chineseIdea}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white rounded-full p-3 shadow-lg transform transition-transform hover:scale-110 active:scale-95"
            >
              <Languages className={`w-5 h-5 ${isTranslating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              英文咒語 (Prompt) - 送往 AI 模型的實際內容
            </label>
            <textarea 
              className="w-full bg-slate-800 text-green-400 font-mono text-sm border-none rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none h-32 leading-relaxed shadow-inner"
              value={promptData.englishPrompt}
              onChange={(e) => setPromptData({...promptData, englishPrompt: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!sourceImage || !promptData.englishPrompt}
          className="mt-6 w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed z-10"
        >
          <Palette className="w-6 h-6" />
          開始魔法轉換
        </button>
      </div>
    </div>
  );

  // 3. 處理中畫面
  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-20">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-dashed border-amber-300 rounded-full animate-[spin_4s_linear_infinite]"></div>
        <div className="absolute inset-4 border-4 border-dashed border-sky-300 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
        <Sparkles className="w-16 h-16 text-amber-500 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">魔法陣運轉中...</h3>
        <p className="text-sky-600 font-medium animate-pulse">正在向 Google AI 雲端發送運算請求 (約需等待 10-15 秒)</p>
      </div>
    </div>
  );

  // 4. 馬克杯預覽與下載
  const renderPreview = () => (
    <div className="flex flex-col items-center space-y-10 animate-fade-in w-full max-w-4xl py-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          生成完成！專屬馬克杯預覽
        </h2>
        <p className="text-gray-500">檢視你的魔法成果，或下載高解析度圖檔列印</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
        <div className="flex justify-center items-center py-10">
          <div className="relative w-64 h-80 mx-auto group">
            <div className="absolute right-[-35px] top-16 w-24 h-40 border-[14px] border-white rounded-r-full shadow-lg -z-10 group-hover:rotate-3 transition-transform origin-left"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-[2.5rem] shadow-2xl border-2 border-white overflow-hidden flex flex-col items-center pt-16 group-hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-gray-100 to-transparent"></div>
              <div className="w-48 h-48 rounded-xl overflow-hidden shadow-inner bg-white/50 border border-white/50 relative z-10 transform -rotate-2">
                <img src={generatedImage} alt="Generated Chibi" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="absolute top-0 left-8 w-16 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 pointer-events-none transform skew-x-12 z-20"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/20 rounded-[100%] blur-md -z-20"></div>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-sky-50">
            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-400" />
              最終使用的咒語
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-gray-600 font-mono overflow-auto max-h-32">
              {promptData.englishPrompt}
            </div>
          </div>

          <div className="space-y-4">
             <button 
                onClick={() => window.open(generatedImage, '_blank')}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-6 h-6" />
                下載高解析度列印檔 (PNG)
              </button>
              
              <button 
                onClick={() => setStep('upload')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-lg py-4 rounded-xl shadow border-2 border-gray-200 transform transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                修改咒語 (重試)
              </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. 教學面板 (監控 Terminal 日誌)
  const renderTeacherPanel = () => (
    <div className="w-full bg-slate-900 rounded-t-2xl overflow-hidden shadow-2xl flex flex-col h-48 border-t-4 border-sky-500 mt-12">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
        <span className="text-sky-400 font-mono text-sm flex items-center gap-2 font-bold">
          <Cpu className="w-4 h-4" />
          教學用控制台 (前端網路請求監控)
        </span>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-black/20">
          {logs.length === 0 && <span className="text-gray-500">等待使用者操作...</span>}
          {logs.map((log, i) => (
            <div key={i} className={`
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'warning' ? 'text-amber-400' : ''}
              ${log.type === 'info' ? 'text-sky-300' : ''}
            `}>
              <span className="text-gray-500">[{log.time}]</span> {log.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-sky-100 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-300 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              校園 Q 版人像生成器 <span className="text-sm font-normal text-sky-500 ml-2 bg-sky-50 px-2 py-1 rounded-full">教學專用版</span>
            </h1>
          </div>
          
          {groupId && (
            <div className="flex items-center gap-4">
              <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                目前使用：第 {groupId} 組金鑰
              </div>
              <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">
                登出 / 清除資料
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-6xl mx-auto">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {step === 'selectGroup' && renderGroupSelection()}
        {step === 'upload' && renderUploadAndPrompt()}
        {step === 'processing' && renderProcessing()}
        {step === 'preview' && renderPreview()}
      </main>

      {renderTeacherPanel()}
    </div>
  );
}