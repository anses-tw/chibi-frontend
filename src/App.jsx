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
  const [sourceImageBase64, setSourceImageBase64] = useState(null);
  const [promptData, setPromptData] = useState({ 
    chineseIdea: '', 
    englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' 
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [logs, setLogs] = useState([]);

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
      addLog(`照片載入成功，準備進行視覺特徵萃取...`, 'info');

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          setSourceImageBase64(base64Data);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranslate = async () => {
    if (!promptData.chineseIdea && !sourceImageBase64) return;
    setIsTranslating(true);
    addLog(`[POST] 發送照片與文字，請 AI 進行視覺特徵分析與翻譯...`, 'info');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          groupId: groupId, 
          chineseIdea: promptData.chineseIdea || "依照照片人物產生", 
          imageBase64: sourceImageBase64 
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "分析失敗");
      
      setPromptData(prev => ({ ...prev, englishPrompt: data.englishPrompt }));
      addLog(`[200 OK] 視覺特徵融合翻譯成功！`, 'success');
    } catch (err) {
      setErrorState({ status: 400, message: err.message });
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
    setSourceImageBase64(null);
    setGeneratedImage(null);
    setPromptData({ chineseIdea: '', englishPrompt: 'chibi style, cute anime character, highly detailed, masterpiece' });
    setErrorState(null);
    addLog(`系統已重置。`, 'info');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `chibi_avatar_${Date.now()}.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`照片下載指令已送出！`, 'success');
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
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-inner group min-h-[300px]">
            <img src={sourceImage} className="w-full h-full object-cover rounded-2xl" alt="Source" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <label className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-amber-300 transition-colors">
                更換照片
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-50 flex flex-col relative">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-amber-500" /> 2. 提示詞魔法實驗室</h3>
        {errorState && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-800 text-sm font-bold flex items-start gap-3"><ShieldAlert className="w-5 h-5 shrink-0" /><div>{errorState.message}</div></div>}
        
        <div className="space-y-2 mb-4">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              中文許願池 (Idea)
              <span className="text-xs font-normal text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">支援翻譯與照片特徵提取</span>
            </label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 focus:ring-2 focus:ring-amber-300 focus:outline-none resize-none" placeholder="例如：穿著水手服，戴著貓耳..." value={promptData.chineseIdea} onChange={(e) => setPromptData({...promptData, chineseIdea: e.target.value})} />
            
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

        <div className="flex justify-center -my-2 relative z-20 mb-4">
          <button onClick={handleTranslate} disabled={isTranslating || (!promptData.chineseIdea && !sourceImageBase64)} className="bg-sky-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 disabled:bg-gray-300 transition-transform flex items-center gap-2">
            <Languages className={`w-5 h-5 ${isTranslating ? 'animate-spin' : ''}`} />
            {isTranslating ? '視覺分析與翻譯中...' : '萃取照片特徵並轉換'}
          </button>
        </div>
        
        <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-gray-600">
              英文咒語 (Prompt) - 送往 AI 模型的實際內容
            </label>
            <textarea className="w-full bg-slate-800 text-green-400 font-mono text-sm rounded-xl p-3 h-32 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none shadow-inner" value={promptData.englishPrompt} readOnly />
        </div>
        
        <button onClick={handleGenerate} disabled={!sourceImage || !promptData.englishPrompt} className="w-full bg-gradient-to-r from-amber-400 to-amber-500 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2">
            <Palette className="w-6 h-6" />
            開始生成專屬 Q 版
        </button>
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
          
          <button onClick={handleDownload} className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transform transition-transform active:scale-95 flex items-center gap-2">
            <Download className="w-5 h-5" />
            下載照片
          </button>
          
          <button onClick={() => setStep('upload')} className="text-gray-500 underline">再試一次</button>
        </div>
      )}
      
      <div className="w-full max-w-6xl bg-slate-900 rounded-t-2xl p-4 mt-12 h-40 overflow-y-auto font-mono text-xs text-sky-300">
        <div className="text-slate-500 mb-2 font-bold uppercase">教學控制台日誌：</div>
        {logs.map((log, i) => <div key={log.time+i}>[{log.time}] {log.msg}</div>)}
      </div>
    </div>
  );
}