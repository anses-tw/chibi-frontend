import React, { useState } from 'react';
import { 
  UploadCloud, Sparkles, Languages, Image as ImageIcon, 
  Download, RefreshCcw, CheckCircle2, 
  Terminal, ShieldAlert, Cpu, Palette, Users
} from 'lucide-react';

export default function CampusChibiGenerator() {
  const [step, setStep] = useState('selectGroup'); 
  const [groupId, setGroupId] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [promptData, setPromptData] = useState({ 
    chineseIdea: '', 
    englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' 
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [logs, setLogs] = useState([]);

  // --- 你的專屬後端網址 ---
  const BACKEND_URL = "https://chibi-backend-q3xl.onrender.com";

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const handleGroupSelect = (id) => {
    setGroupId(id);
    setStep('upload');
    addLog(`選擇第 ${id} 組，已綁定雲端 API Key。`, 'success');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSourceImage(URL.createObjectURL(file));
      addLog(`照片載入成功: ${file.name}`, 'info');
    }
  };

  const handleTranslate = async () => {
    if (!promptData.chineseIdea) return;
    setIsTranslating(true);
    addLog(`[POST] 發送翻譯請求至 Render...`, 'info');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: groupId, chineseIdea: promptData.chineseIdea })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "翻譯失敗");
      
      setPromptData(prev => ({ ...prev, englishPrompt: data.englishPrompt }));
      addLog(`[200 OK] 翻譯成功！`, 'success');
    } catch (err) {
      addLog(`[Error] ${err.message}`, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerate = async () => {
    setStep('processing');
    setErrorState(null);
    addLog(`[POST] 向雲端廚房發送生圖請求...`, 'warning');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: groupId, prompt: promptData.englishPrompt })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "生圖失敗");

      setGeneratedImage(data.imageUrl); 
      setStep('preview');
      addLog(`[200 OK] 圖片生成成功！`, 'success');
    } catch (err) {
      setErrorState({ status: 400, message: err.message });
      setStep('upload');
      addLog(`[Error] ${err.message}`, 'error');
    }
  };

  const handleReset = () => {
    setStep('selectGroup');
    setGroupId(null);
    setSourceImage(null);
    setGeneratedImage(null);
    setPromptData({ chineseIdea: '', englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' });
    setErrorState(null);
    addLog(`系統已重置。`, 'info');
  };

  const renderGroupSelection = () => (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-sky-500" />
          請選擇你的小組
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {[1, 2, 3, 4, 5].map(id => (
          <button key={id} onClick={() => handleGroupSelect(id)} className="w-32 h-32 rounded-3xl bg-white shadow-xl hover:-translate-y-2 transition-all border-b-4 border-sky-100 flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-amber-300 text-white flex items-center justify-center text-xl font-bold">{id}</div>
            <span className="font-semibold text-gray-600">第 {id} 組</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderUploadAndPrompt = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-sky-50 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4"><ImageIcon className="w-6 h-6 text-sky-500" /> 1. 載入照片</h3>
        {!sourceImage ? (
          <label className="flex-1 border-4 border-dashed border-sky-100 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-sky-50 transition-colors min-h-[300px]">
            <UploadCloud className="w-10 h-10 text-sky-400" />
            <p className="text-lg font-semibold text-gray-700">點擊上傳</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <img src={sourceImage} className="w-full h-full object-cover rounded-2xl min-h-[300px]" alt="Source" />
        )}
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-50 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-amber-500" /> 2. 提示詞實驗室</h3>
        {errorState && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-800 text-sm font-bold">{errorState.message}</div>}
        <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 mb-4" placeholder="中文想法..." value={promptData.chineseIdea} onChange={(e) => setPromptData({...promptData, chineseIdea: e.target.value})} />
        <div className="flex justify-center mb-4">
          <button onClick={handleTranslate} disabled={isTranslating} className="bg-sky-500 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
            <Languages className={`w-5 h-5 ${isTranslating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <textarea className="w-full bg-slate-800 text-green-400 font-mono text-sm rounded-xl p-3 h-32 mb-6" value={promptData.englishPrompt} readOnly />
        <button onClick={handleGenerate} disabled={!sourceImage} className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">開始魔法轉換</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6">
      <header className="w-full max-w-6xl flex justify-between items-center mb-10 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Sparkles className="text-amber-400" /> 校園 Q 版人像生成器</h1>
        {groupId && <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 font-bold">登出 / 重置</button>}
      </header>
      {step === 'selectGroup' && renderGroupSelection()}
      {step === 'upload' && renderUploadAndPrompt()}
      {step === 'processing' && (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sky-600 font-bold animate-pulse">魔法運算中 (約 15 秒)...</p>
        </div>
      )}
      {step === 'preview' && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <h2 className="text-2xl font-bold">✨ 生成完成！</h2>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-8 border-gray-100">
            <img src={generatedImage} alt="Chibi" className="w-48 h-48 rounded-xl shadow-inner" />
          </div>
          <button onClick={() => window.open(generatedImage)} className="bg-sky-500 text-white px-8 py-3 rounded-full font-bold">下載照片</button>
          <button onClick={() => setStep('upload')} className="text-gray-500 underline">再試一次</button>
        </div>
      )}
      <div className="w-full max-w-6xl bg-slate-900 rounded-t-2xl p-4 mt-12 h-40 overflow-y-auto font-mono text-xs text-sky-300">
        <div className="text-slate-500 mb-2 font-bold uppercase">教學控制台日誌：</div>
        {logs.map((log, i) => <div key={i}>[{log.time}] {log.msg}</div>)}
      </div>
    </div>
  );
}