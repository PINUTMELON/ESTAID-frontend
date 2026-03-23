"use client";

import { useState, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { qualities, ratios, styles } from '@/app/_constants/create';
import { angles } from '@/app/_constants/scene';
import StepCard from '@/app/_components/StepCard';
import CameraAngleSelect from '@/app/_components/CameraAngleSelect';
import { useNewProject } from '@/app/_hooks/useNewProject';
import { assetApi, plotApi } from '@/app/_utils/api';

// --- Interfaces ---
export interface Scene {
  id: string;
  characterIds: string[];
  backgroundId: string;
  composition: typeof angles[0];
  lighting: string;
  story: string;
  firstFrame: string;
  lastFrame: string;
  firstFrameImageUrl?: string;
  lastFrameImageUrl?: string;
  title: string;      // 씬 제목 추가
  imageUrl?: string;
}

function NewCreationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Use Custom Hook ---
  const {
    step, setStep,
    characters, addCharacter, removeCharacter,
    backgrounds, addBackground, removeBackground,
    scenes, setScenes, updateScene
  } = useNewProject();

  // --- Step 1 & 2: Local Editing States ---
  const [charName, setCharName] = useState('');
  const [bgName, setBgName] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string | null>(null);
  const [quality, setQuality] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Step 3 & 4 States ---
  const [storyInput, setStoryInput] = useState('');
  const [sceneCount, setSceneCount] = useState(4);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  const [hasGeneratedScenes, setHasGeneratedScenes] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<{ [key: string]: boolean }>({});


  // --- Handlers ---
  const handleGoNext = async () => {
    if (step === 1) {
      if (characters.length > 0) setStep(2);
    } else if (step === 2) {
      if (backgrounds.length > 0) setStep(3);
    } else if (step === 3) {
      if (scenes.length === 0) {
        alert("최소 한 개 이상의 씬이 필요합니다.");
        return;
      }

      try {
        const payload = {
          scenes: scenes.map((s, idx) => ({
            sceneNumber: idx + 1,
            title: s.title || `Scene ${idx + 1}`,
            composition: mapAngleToComposition(s.composition.id),
            background: backgrounds.find(b => b.id === s.backgroundId)?.name || '',
            backgroundDetail: backgrounds.find(b => b.id === s.backgroundId)?.description || '',
            lighting: s.lighting,
            majorStory: s.story,
            firstFramePrompt: s.firstFrame,
            firstFrameImageUrl: s.firstFrameImageUrl,
            lastFramePrompt: s.lastFrame,
            lastFrameImageUrl: s.lastFrameImageUrl
          }))
        };

        const response = await plotApi.updateScenes(projectId!, payload);
        if (response.success) {
          router.push(`/generate?projectId=${projectId}`);
        }
      } catch (error) {
        console.error("Failed to save scenes:", error);
        alert("씬 저장에 실패했습니다.");
      }
    } else if (step === 4) {
      router.push(`/main/projects/${projectId}`);
    }
  };

  const handleGoPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const isReadyToGenerate = (step === 1 ? charName.trim() : bgName.trim()) && ratio && quality && uploadedImage;

  const handleGenerate = async () => {
    if (!isReadyToGenerate || isGenerating || !projectId) return;

    if (!selectedFile) {
      alert("참조 이미지를 업로드해주세요.");
      return;
    }

    setIsGenerating(true);
    setPreviewImage("");
    
    try {
      const assetType = step === 1 ? 'characters' : 'backgrounds';
      const formData = new FormData();
      formData.append('name', step === 1 ? charName : bgName);
      
      // 스타일 매핑 (3D ART -> 3D)
      let mappedStyle = style || 'REALISTIC';
      if (mappedStyle === '3D ART') mappedStyle = '3D';
      formData.append('style', mappedStyle);

      if (ratio) formData.append('ratio', ratio);

      // 품질 매핑
      if (quality) {
        const mappedQuality = quality === '고화질' ? 'High' : 'Standard';
        formData.append('quality', mappedQuality);
      }

      // 이미지는 있는 경우에만 추가
      if (selectedFile) {
        formData.append('referenceImage', selectedFile);
      }

      const response = await assetApi.create(projectId, assetType, formData);
      
      // 서버 응답이 ApiResponse<T>가 아닌 데이터를 직접 반환할 수 있으므로 보정
      const responseData = (response as any).success ? (response as any).data : response;
      
      if (responseData.id) {
        const { id, name, imageUrl } = responseData;
        if (step === 1) {
          addCharacter({ id, name, imageUrl, style: style || undefined, description: description || undefined });
          setCharName('');
        } else {
          addBackground({ id, name, imageUrl, style: style || undefined, description: description || undefined });
          setBgName('');
        }
        // 초기화
        setSelectedFile(null);
        setUploadedImage(null);
        setRatio(null);
        setQuality(null);
        setStyle(null);
      }
    } catch (error) {
      console.error("Asset creation failed:", error);
      alert(error instanceof Error ? error.message : "자산 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveAsset = async (id: string) => {
    if (!projectId) return;
    const assetType = step === 1 ? 'characters' : 'backgrounds';
    if (!confirm('정말로 이 자산을 삭제하시겠습니까?')) return;

    try {
      const res = await assetApi.delete(projectId, assetType, id);
      if (res.success) {
        if (step === 1) removeCharacter(id);
        else removeBackground(id);
      }
    } catch (error) {
      console.error("Asset deletion failed:", error);
      alert("자산 삭제에 실패했습니다.");
    }
  };

  const handleGenerateScenes = async () => {
    if (!storyInput.trim() || !projectId || isGeneratingScenes) return;
    setIsGeneratingScenes(true);
    try {
      const response = await plotApi.generate({
        projectId,
        storyDescription: storyInput.trim(),
        sceneCount,
        ratio: ratio || '16:9'
      });

      if (response.success && response.data.scenes) {
        const newScenes: Scene[] = response.data.scenes.map((s) => {
          // 배경 이름으로 기존 배경 찾기 시도
          const matchedBg = backgrounds.find(b => b.name === s.background);
          
          return {
            id: s.sceneNumber.toString().padStart(2, '0'),
            characterIds: [],
            backgroundId: matchedBg?.id || '',
            composition: mapCompositionToAngle(s.composition),
            lighting: s.lighting,
            story: s.majorStory,
            firstFrame: s.firstFramePrompt,
            lastFrame: s.lastFramePrompt,
            firstFrameImageUrl: s.firstFrameImageUrl || undefined,
            lastFrameImageUrl: s.lastFrameImageUrl || undefined,
            title: s.title,
          };
        });
        setScenes(newScenes);
        setHasGeneratedScenes(true);
      }
    } catch (error) {
      console.error("Storyboard generation failed:", error);
      const errorMsg = (error as any)?.message || "";
      if (errorMsg.includes("400")) {
        alert("이미 이 프로젝트에 생성된 플롯이 있습니다.");
      } else {
        alert("AI 스토리보드 생성에 실패했습니다.");
      }
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  const mapCompositionToAngle = (comp: string) => {
    const mapping: Record<string, string> = {
      'EXTREME_CLOSEUP': 'extreme',
      'HIGH_ANGLE': 'high',
      'LOW_ANGLE': 'low',
      'MEDIUM_SHOT': 'medium',
      'OVER_THE_SHOULDER': 'shoulder',
      'TWO_SHOT': 'two',
      'WIDE_SHOT': 'wide',
      'BIRD_EYE_VIEW': 'birdeyeview',
      'CLOSEUP': 'closeup',
      'DUTCH_ANGLE': 'dutch'
    };
    const angleId = mapping[comp] || 'wide';
    return angles.find(a => a.id === angleId) || angles[7]; // fallback to wide shot
  };

  const mapAngleToComposition = (angleId: string) => {
    const reverseMapping: Record<string, string> = {
      'extreme': 'EXTREME_CLOSEUP',
      'high': 'HIGH_ANGLE',
      'low': 'LOW_ANGLE',
      'medium': 'MEDIUM_SHOT',
      'shoulder': 'OVER_THE_SHOULDER',
      'two': 'TWO_SHOT',
      'wide': 'WIDE_SHOT',
      'birdeyeview': 'BIRD_EYE_VIEW',
      'closeup': 'CLOSEUP',
      'dutch': 'DUTCH_ANGLE'
    };
    return reverseMapping[angleId] || 'WIDE_SHOT';
  };

  const handleRegenerateFrame = async (idx: number, firstOrLast: "FIRST" | "LAST") => {
    if (!projectId) return;
    const scene = scenes[idx];
    const sceneNumber = idx + 1; // 1부터 시작 (id가 '01', '02' 형식이므로 idx+1 권장)
    const prompt = firstOrLast === "FIRST" ? scene.firstFrame : scene.lastFrame;

    // 로딩 상태 구분 (idx-TYPE)
    const stateKey = `${idx}-${firstOrLast}`;
    setIsRegenerating(prev => ({ ...prev, [stateKey]: true }));

    try {
      const response = await plotApi.regenerateFrame({
        projectId,
        sceneNumber,
        firstOrLast,
        prompt
      });

      if (response.success && response.data.imageUrl) {
        if (firstOrLast === "FIRST") {
          updateSceneField(idx, { firstFrameImageUrl: response.data.imageUrl });
        } else {
          updateSceneField(idx, { lastFrameImageUrl: response.data.imageUrl });
        }
      }
    } catch (error) {
      console.error("Frame regeneration failed:", error);
      alert("이미지 생성에 실패했습니다.");
    } finally {
      setIsRegenerating(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  const updateSceneField = (idx: number, field: Partial<Scene>) => updateScene(idx, field);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  // --- Layout Components ---
  const PageHeader = ({ title }: { title: string }) => (
    <div className="p-6 border-b border-white/5 bg-[#0B0B0B]">
      <header className="flex items-center gap-3">
        <Image src="/images/create-generate.svg" width={22} height={20} alt="아이콘" />
        <h1 className="text-2xl font-semibold">{title}</h1>
      </header>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#0B0B0B] text-white overflow-hidden font-sans">
      <aside className="w-64 border-r border-white/5 p-8 flex flex-col justify-between items-center flex-shrink-0 bg-[#0B0B0B]">
        <div className="flex flex-col items-center w-full space-y-10">
          <Link href="/main/projects"><Image src="/images/logo.png" width={125} height={30} alt="로고" className="h-auto" /></Link>
          <nav className="space-y-4 w-full px-2">
            <StepCard stepNumber={1} title="캐릭터 만들기" isActive={step === 1} isCompleted={characters.length > 0} />
            <StepCard stepNumber={2} title="배경 만들기" isActive={step === 2} isCompleted={backgrounds.length > 0} />
            <StepCard stepNumber={3} title="씬 만들기" isActive={step === 3} isCompleted={step > 3} />
          </nav>
        </div>
        <div className="space-y-3 w-full">
          {step > 1 && <button onClick={handleGoPrev} className="w-full py-4 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition-all outline-none">이전 단계로</button>}
          <button
            onClick={handleGoNext}
            disabled={step === 1 ? characters.length === 0 : step === 2 ? backgrounds.length === 0 : false}
            className={`w-full py-4 rounded-xl text-sm font-bold transition-all uppercase ${(step === 1 ? characters.length > 0 : step === 2 ? backgrounds.length > 0 : true) ? 'bg-primary-100 text-white shadow-lg active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            {step === 3 ? "마무리 및 저장" : "다음"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden">
        {/* Steps 1 & 2 */}
        {(step === 1 || step === 2) && (
          <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col bg-[#0B0B0B] min-w-0">
              <PageHeader title={step === 1 ? "캐릭터 만들기" : "배경 만들기"} />
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="space-y-8 max-w-4xl">
                  <section className="space-y-3">
                    <h3 className="text-[13px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">{step === 1 ? "캐릭터 이름" : "배경 이름"}<span className="text-primary-100">*</span></h3>
                    <input
                      type="text" value={step === 1 ? charName : bgName}
                      onChange={(e) => step === 1 ? setCharName(e.target.value) : setBgName(e.target.value)}
                      placeholder="이름 입력..."
                      className="w-full h-14 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-sm focus:outline-none focus:border-primary-100/50 transition-colors"
                    />
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-[13px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">참고 이미지<span className="text-primary-100">*</span></h3>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center aspect-square h-40 border-2 border-dashed rounded-2xl transition-all cursor-pointer group overflow-hidden ${uploadedImage ? 'border-primary-100/50 bg-black/40' : 'border-white/5 bg-[#1a1a1e] hover:border-primary-100/40'
                        }`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />

                      {uploadedImage ? (
                        <div className="absolute inset-0 w-full h-full">
                          <Image src={uploadedImage} alt="Uploaded preview" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                            <p className="text-12 font-black text-white px-4 py-2 bg-primary-100 rounded-full shadow-xl translate-y-2 group-hover:translate-y-0 transition-all">이미지 교체하기</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          </div>
                          <p className="text-12 font-bold text-white/40">이미지 업로드</p>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-[13px] font-black text-white/80 uppercase tracking-widest">스타일</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {styles.map((s) => (
                        <div key={s.name} onClick={() => setStyle(s.name)} className={`relative w-16 aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${style === s.name ? 'border-primary-100 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}><img src={s.img} className="w-full h-full object-cover" /><div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-[7px] text-center">{s.name}</div></div>
                      ))}
                    </div>
                  </section>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3"><h3 className="text-[13px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">비율<span className="text-primary-100">*</span></h3><div className="flex gap-2">{ratios.map((r) => (<button key={r} onClick={() => setRatio(r)} className={`px-3 py-1.5 rounded-lg text-11 font-bold border transition-all ${ratio === r ? 'border-primary-100 bg-primary-100/10' : 'border-white/5 text-white/20'}`}>{r}</button>))}</div></div>
                    <div className="space-y-3"><h3 className="text-[13px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">품질<span className="text-primary-100">*</span></h3><div className="flex gap-1 bg-[#1a1a1e] p-1 rounded-lg">{qualities.map((q) => (<button key={q} onClick={() => setQuality(q)} className={`flex-1 py-1 text-10 font-bold rounded flex items-center justify-center transition-all ${quality === q ? 'bg-primary-100 text-white' : 'text-white/20'}`}>{q}</button>))}</div></div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 bg-[#0B0B0B]/80 backdrop-blur-xl">
                <button onClick={handleGenerate} disabled={!isReadyToGenerate || isGenerating} className={`w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-3 ${isReadyToGenerate && !isGenerating ? 'bg-primary-100 text-white shadow-xl shadow-primary-300/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>{isGenerating ? "창조하는 중..." : "AI로 이미지 생성하기"}</button>
              </div>
            </div>
            <div className="w-[400px] bg-[#0a0a0a] flex flex-col shrink-0 border-l border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5"><h3 className="text-lg font-black italic text-white/90 tracking-tighter">{step === 1 ? "프로젝트 캐릭터" : "프로젝트 배경"}</h3><p className="text-white/20 text-[10px] font-bold uppercase tracking-widest pl-0.5">Assets Collection</p></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pr-4">
                <div className="grid grid-cols-2 gap-3">
                  {isGenerating && <div className="relative aspect-square rounded-2xl border-2 bg-white/5 border-dashed border-white/10 animate-pulse flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary-100 border-t-transparent rounded-full animate-spin" /></div>}
                  {(step === 1 ? characters : backgrounds).map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-[#111113] border border-white/5 ring-1 ring-white/5 hover:ring-primary-100/30 transition-all">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 text-[10px] font-black">
                        <p className="truncate mb-1">{item.name}</p>
                        <button onClick={() => handleRemoveAsset(item.id)} className="text-[8px] text-red-400/60 hover:text-red-400 uppercase">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                {!(isGenerating || (step === 1 ? characters : backgrounds).length > 0) && <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic p-10 font-bold tracking-widest text-[10px]">생성된 자산이 없습니다.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500 overflow-hidden">
            <PageHeader title="씬 만들기" />
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              <section className="max-w-7xl">
                {!hasGeneratedScenes && (
                  <div className="border border-white/5 rounded-xl p-6 grid grid-cols-12 gap-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="col-span-6 space-y-2 flex flex-col">
                      <label className="text-sm font-bold text-gray-400">스토리 설명</label>
                      <textarea
                        value={storyInput}
                        onChange={(e) => setStoryInput(e.target.value)}
                        placeholder="스토리 입력..."
                        className="w-full h-32 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-sm resize-none focus:outline-none focus:border-primary-100/50 transition-colors"
                      />
                    </div>
                    <div className="col-span-6 flex flex-col justify-between items-end">
                      <div className="w-full space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold text-gray-400">씬 갯수</label>
                            <input
                              type="number"
                              min="1" max="12"
                              value={sceneCount}
                              onChange={(e) => setSceneCount(Number(e.target.value))}
                              className="mt-2 w-full bg-[#1a1a1e] border border-border-100 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-100/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-gray-400">비율</label>
                            <div className="mt-2 flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                              {ratios.map((r) => (
                                <button
                                  key={r}
                                  onClick={() => setRatio(r)}
                                  className={`px-2 py-1.5 rounded-lg text-9 font-bold border transition-all shrink-0 ${ratio === r ? 'border-primary-100 bg-primary-100/10 text-primary-100' : 'border-white/5 text-white/20 hover:text-white/40'}`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={handleGenerateScenes}
                          disabled={isGeneratingScenes || !storyInput.trim()}
                          className={`w-full py-4 bg-primary-100 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-300/10 active:scale-95 transition-all ${isGeneratingScenes || !storyInput.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {isGeneratingScenes ? (
                            <>
                              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>AI 씬 만드는 중...</span>
                            </>
                          ) : (
                            <>🪄 AI 씬 생성</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {hasGeneratedScenes && (
                  <div className="bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in-95 duration-700">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-center border-collapse min-w-[1200px]">
                        <thead><tr className="bg-white/[0.03] text-[11px] text-white/40 font-bold border-b border-white/5 uppercase tracking-widest"><th className="p-4 w-48">제목</th><th className="p-4 w-44">등장인물</th><th className="p-4 w-40">구도</th><th className="p-4 w-48">배경</th><th className="p-4 w-48">조명</th><th className="p-4 min-w-[300px]">주요 스토리</th><th className="p-4 w-48">첫 프레임</th><th className="p-4 w-48">마지막 프레임</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                        {scenes.map((scene, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.01]">
                            <td className="p-4 align-top text-left space-y-2 pt-6">
                              <span className="font-bold text-xl text-white/10 block">{scene.id}</span>
                              <input
                                type="text"
                                value={scene.title || ""}
                                onChange={(e) => updateSceneField(idx, { title: e.target.value })}
                                placeholder="제목 입력..."
                                className="w-full bg-[#1a1a1e] border border-border-100 rounded-lg p-2 px-3 text-[11px] focus:outline-none focus:border-primary-100/50 transition-colors"
                              />
                            </td>
                            <td className="p-4 align-top pt-6">
                              <div className="flex flex-col gap-1.5">
                                {scene.characterIds?.map(id => { const c = characters.find(ch => ch.id === id); return c ? <span key={id} className="px-2 py-1 bg-primary-100/10 border border-primary-100/20 rounded text-[9px] text-primary-200">{c.name}</span> : null; })}
                                <select
                                  className="bg-[#1a1a1e] border border-border-100 rounded-lg text-[10px] text-primary-100/60 focus:ring-0 cursor-pointer p-1 px-2"
                                  onChange={e => { const val = e.target.value; if (val && !scene.characterIds.includes(val)) updateSceneField(idx, { characterIds: [...scene.characterIds, val] }); }}
                                >
                                  <option value="">+ 추가</option>
                                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                            </td>
                            <td className="p-4 align-top pt-6"><CameraAngleSelect value={scene.composition} onChange={a => updateSceneField(idx, { composition: a })} /></td>
                            <td className="p-4 align-top pt-6">
                              <div className="space-y-1.5">
                                <select
                                  value={scene.backgroundId}
                                  onChange={e => updateSceneField(idx, { backgroundId: e.target.value })}
                                  className="w-full bg-[#1a1a1e] border border-border-100 rounded-lg p-2 px-3 text-xs appearance-none focus:outline-none focus:border-primary-100/50 transition-colors"
                                >
                                  <option value="">배경 선택</option>
                                  {backgrounds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <div className="text-[9px] text-white/20 italic text-left">
                                  {backgrounds.find(b => b.id === scene.backgroundId)?.description || "선택된 배경 없음."}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 align-top pt-6">
                              <textarea
                                value={scene.lighting}
                                onChange={e => updateSceneField(idx, { lighting: e.target.value })}
                                className="w-full h-24 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-[11px] resize-none focus:outline-none focus:border-primary-100/50 transition-colors"
                              />
                            </td>
                            <td className="p-2 align-top pt-6">
                              <textarea
                                value={scene.story}
                                onChange={e => updateSceneField(idx, { story: e.target.value })}
                                className="w-full h-24 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-[11px] font-bold resize-none focus:outline-none focus:border-primary-100/50 transition-colors"
                              />
                            </td>
                            <td className="p-2 align-top pt-6">
                              <div className="space-y-2">
                                <div className="aspect-video relative rounded-lg overflow-hidden bg-white/5 border border-white/5 group/img">
                                  {scene.firstFrameImageUrl || scene.imageUrl ? (
                                    <Image src={scene.firstFrameImageUrl || scene.imageUrl || ""} alt="preview" fill className="object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/10 italic">No Image</div>
                                  )}

                                  <button
                                    onClick={() => handleRegenerateFrame(idx, "FIRST")}
                                    disabled={isRegenerating[`${idx}-FIRST`]}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center text-[10px] font-bold gap-2 text-primary-100 uppercase"
                                  >
                                    {isRegenerating[`${idx}-FIRST`] ? (
                                      <div className="w-4 h-4 border-2 border-primary-100 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>🪄 재생성</>
                                    )}
                                  </button>
                                </div>
                                <textarea
                                  value={scene.firstFrame}
                                  onChange={e => updateSceneField(idx, { firstFrame: e.target.value })}
                                  className="w-full h-24 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-[11px] resize-none focus:outline-none focus:border-primary-100/50 transition-colors"
                                />
                              </div>
                            </td>
                            <td className="p-2 align-top pt-6">
                              <div className="space-y-2">
                                <div className="aspect-video relative rounded-lg overflow-hidden bg-white/5 border border-white/5 group/img">
                                  {scene.lastFrameImageUrl || scene.imageUrl ? (
                                    <Image src={scene.lastFrameImageUrl || scene.imageUrl || ""} alt="preview" fill className="object-cover scale-x-[-1]" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/10 italic">No Image</div>
                                  )}

                                  <button
                                    onClick={() => handleRegenerateFrame(idx, "LAST")}
                                    disabled={isRegenerating[`${idx}-LAST`]}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center text-[10px] font-bold gap-2 text-primary-100 uppercase"
                                  >
                                    {isRegenerating[`${idx}-LAST`] ? (
                                      <div className="w-4 h-4 border-2 border-primary-100 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>🪄 재생성</>
                                    )}
                                  </button>
                                </div>
                                <textarea
                                  value={scene.lastFrame}
                                  onChange={e => updateSceneField(idx, { lastFrame: e.target.value })}
                                  className="w-full h-24 bg-[#1a1a1e] border border-border-100 rounded-xl p-3 px-4 text-[11px] resize-none focus:outline-none focus:border-primary-100/50 transition-colors"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}
              </section>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function NewCreationPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#0B0B0B] flex items-center justify-center text-primary-100 animate-pulse text-2xl font-black italic uppercase">Producing your vision...</div>}><NewCreationContent /></Suspense>
  );
}
