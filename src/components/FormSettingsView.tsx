import React, { useRef, useState, useEffect } from "react";
import { 
  Palette, 
  Eraser, 
  RotateCcw, 
  Check, 
  Sliders, 
  Type, 
  Image as ImageIcon, 
  FileText, 
  Eye, 
  Square,
  Sparkles
} from "lucide-react";

interface FormSettingsViewProps {
  onClose?: () => void;
  onToast?: (msg: string, type: 'success' | 'err') => void;
}

export default function FormSettingsView({ onClose, onToast }: FormSettingsViewProps) {
  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const [hasSignature, setHasSignature] = useState(false);

  // Form Style state (persisted in localStorage)
  const [borderStyle, setBorderStyle] = useState<"standard" | "grid" | "horizontal">("standard");
  const [titleSize, setTitleSize] = useState<"10px" | "12px" | "14px" | "18px">("10px");
  const [logoSize, setLogoSize] = useState<"60px" | "80px" | "110px">("80px");
  const [showStamp, setShowStamp] = useState(true);
  const [themeColor, setThemeColor] = useState("#4f46e5"); // indigo default
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const savedB = localStorage.getItem("crm_form_border_style") as any;
    if (savedB) setBorderStyle(savedB);

    const savedTS = localStorage.getItem("crm_form_title_size") as any;
    if (savedTS) setTitleSize(savedTS);

    const savedLS = localStorage.getItem("crm_form_logo_size") as any;
    if (savedLS) setLogoSize(savedLS);

    const savedStamp = localStorage.getItem("crm_form_show_stamp");
    if (savedStamp !== null) setShowStamp(savedStamp === "true");

    const savedTheme = localStorage.getItem("crm_form_theme_color");
    if (savedTheme) setThemeColor(savedTheme);

    const savedSig = localStorage.getItem("saved_authorized_signature");
    if (savedSig) {
      setSavedSignature(savedSig);
      setHasSignature(true);
    }

    // Initialize Canvas context
    initCanvas();
  }, []);

  // Redraw canvas background grid or loaded signature
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set display size matching CSS pixel dimensions
    canvas.width = 460;
    canvas.height = 160;

    // Background color
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw guidelines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Load saved signature onto canvas if exists
    const loadedSig = localStorage.getItem("saved_authorized_signature");
    if (loadedSig) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = loadedSig;
    }
  };

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save history point before drawing stroke
    saveToHistory();

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  // Drawing in progress
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent scrolling on mobile touch
    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw guide line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    setHistory([]);
    setHasSignature(false);
  };

  // Save history state
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev, canvas.toDataURL()]);
  };

  // Undo Last Brush Stroke
  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousStateUrl = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousStateUrl;

    if (newHistory.length === 0 && !localStorage.getItem("saved_authorized_signature")) {
      setHasSignature(false);
    }
  };

  // Save drawing (signature)
  const saveSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If canvas is blank/empty and no signature drawn
    if (!hasSignature) {
      localStorage.removeItem("saved_authorized_signature");
      setSavedSignature(null);
      if (onToast) onToast("ลบลายเซ็นเดิมแล้ว", "success");
      else alert("ลบลายเซ็นที่บันทึกไว้สำเร็จ");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    localStorage.setItem("saved_authorized_signature", dataUrl);
    setSavedSignature(dataUrl);

    // Trigger update notification
    window.dispatchEvent(new Event("storage"));

    if (onToast) onToast("บันทึกลายเซ็นดิจิทัลแล้ว", "success");
    else alert("บันทึกลายมือชื่อสำเร็จ! ระบบจะดึงลายเซ็นนี้ไปพิมพ์ที่ท้ายใบเสนอราคาอัตโนมัติ");
  };

  // Save all layout styling formats
  const saveFormFormats = () => {
    localStorage.setItem("crm_form_border_style", borderStyle);
    localStorage.setItem("crm_form_title_size", titleSize);
    localStorage.setItem("crm_form_logo_size", logoSize);
    localStorage.setItem("crm_form_show_stamp", String(showStamp));
    localStorage.setItem("crm_form_theme_color", themeColor);

    // Dispatch custom event to notify open quotation views
    window.dispatchEvent(new Event("storage"));

    if (onToast) onToast("บันทึกรูปแบบฟอร์มสำเร็จ", "success");
    else alert("บันทึกการตั้งค่าตารางและสไตล์รูปแบบใบเสนอราคาสำเร็จ!");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 p-6 space-y-8 animate-scale-up">
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/25 border border-indigo-500 rounded-2xl flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              ตั้งค่ารูปแบบฟอร์ม & ลายมือชื่อ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              วาดเส้นลายมือชื่อ เลือกรูปแบบความหนาของเส้นขอบ และสไตล์ตารางในใบเสนอราคา
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white bg-slate-800/60 p-2 rounded-full cursor-pointer transition"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Setup Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Sign Canvas / Pad */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" />
                ลายมือชื่ออิเล็กทรอนิกส์ (Authorized Signature)
              </span>
              <span className="text-[10px] text-slate-500">
                ลากเมาส์หรือใช้นิ้วเขียน เพื่อประทับท้ายฟอร์ม
              </span>
            </div>

            {/* Drawing Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-slate-400 font-bold">สีปากกา:</span>
                <div className="flex gap-1.5">
                  {[
                    { color: "#000000", label: "Black" },
                    { color: "#1e3a8a", label: "Navy" },
                    { color: "#2563eb", label: "Royal" },
                    { color: "#0f766e", label: "Teal" }
                  ].map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setPenColor(p.color)}
                      style={{ backgroundColor: p.color }}
                      className={`w-5.5 h-5.5 rounded-full border cursor-pointer transition ${penColor === p.color ? "border-white scale-110 ring-2 ring-indigo-500" : "border-transparent"}`}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold">ความหนา:</span>
                <select
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="bg-slate-950 text-slate-300 text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-800 focus:outline-none"
                >
                  <option value={2}>บาง (2px)</option>
                  <option value={3}>กลาง (3px)</option>
                  <option value={5}>หนา (5px)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={undo}
                  disabled={history.length === 0}
                  className={`p-1.5 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer ${history.length === 0 ? "text-slate-600 bg-slate-950/20 cursor-not-allowed" : "text-slate-300 bg-slate-800 hover:bg-slate-700"}`}
                  title="ย้อนกลับ (Undo)"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="ล้างข้อมูลทั้งหมด"
                >
                  <Eraser className="w-3.5 h-3.5" /> ล้างหน้าจอ
                </button>
              </div>
            </div>

            {/* Canvas Element */}
            <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-800 flex justify-center relative shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair w-full block bg-white"
                style={{ height: "160px", maxWidth: "460px" }}
              />
              <div className="absolute bottom-2 right-3 pointer-events-none text-[9px] font-bold text-slate-400 select-none bg-slate-100/80 px-2 py-0.5 rounded">
                CANVAS SIGNATURE AREA
              </div>
            </div>

            {/* Save Canvas Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={saveSignatureData}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> บันทึกลายมือชื่อนี้
              </button>
            </div>
          </div>

          {/* Section 2: Table layout and formatting parameters */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              กำหนดรูปแบบตารางและดีไซน์เอกสาร (Table & Paper Formats)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Border Style Option */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400">รูปแบบลายเส้นของตาราง:</label>
                <select
                  value={borderStyle}
                  onChange={(e) => setBorderStyle(e.target.value as any)}
                  className="w-full bg-slate-900 text-white font-semibold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="standard">เส้นขอบนอก + สลับแถว (ไม่มีเส้นแนวนอนข้อมูล)</option>
                  <option value="grid">ตารางกริดเต็มรูปแบบ (ขอบแนวตั้งและแนวนอนคั่นทุกช่อง)</option>
                  <option value="horizontal">ตารางสไตล์ยุโรปมินิมอล (มีเฉพาะเส้นแนวนอนคั่นแถว)</option>
                </select>
              </div>

              {/* Title Size Option */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400">ขนาดหัวเอกสาร "QUOTATION":</label>
                <select
                  value={titleSize}
                  onChange={(e) => setTitleSize(e.target.value as any)}
                  className="w-full bg-slate-900 text-white font-semibold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="10px">มาตรฐาน (10px - กะทัดรัด)</option>
                  <option value="12px">กลาง (12px - เด่นขึ้น)</option>
                  <option value="14px">ใหญ่ (14px - ชัดเจน)</option>
                  <option value="18px">พิเศษ (18px - แบบดั้งเดิม)</option>
                </select>
              </div>

              {/* Logo Size */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400">ความสูงของโลโก้บริษัท:</label>
                <select
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value as any)}
                  className="w-full bg-slate-900 text-white font-semibold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  <option value="60px">กะทัดรัด (60px)</option>
                  <option value="80px">ขนาดปกติ (80px)</option>
                  <option value="110px">ขนาดใหญ่ (110px)</option>
                </select>
              </div>

              {/* Show Stamp Checkbox */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400">กล่องประทับตราบริษัท (Stamp Box):</label>
                <div className="flex items-center gap-2.5 pt-1.5">
                  <input
                    type="checkbox"
                    id="showStampCheck"
                    checked={showStamp}
                    onChange={(e) => setShowStamp(e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-900 border-slate-800 text-cyan-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="showStampCheck" className="text-slate-300 font-semibold cursor-pointer">
                    แสดงช่อง "SIGNATURE & COMPANY STAMP"
                  </label>
                </div>
              </div>

              {/* Form Theme Accent Color */}
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="block font-bold text-slate-400">สีเน้นเอกสาร (Theme Accent Color):</label>
                <div className="flex gap-2.5">
                  {[
                    { hex: "#4f46e5", label: "Indigo" },
                    { hex: "#0284c7", label: "Sky" },
                    { hex: "#059669", label: "Emerald" },
                    { hex: "#dc2626", label: "Rose" },
                    { hex: "#d97706", label: "Amber" },
                    { hex: "#1e293b", label: "Slate / Dark" }
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setThemeColor(color.hex)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold text-white flex items-center gap-1.5 cursor-pointer transition ${themeColor === color.hex ? "scale-105 ring-2 ring-indigo-500" : "border-slate-800"}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <Square className="w-3 h-3 fill-white" />
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Save Styling Form button */}
            <div className="flex justify-end pt-2 border-t border-slate-900">
              <button
                type="button"
                onClick={saveFormFormats}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> บันทึกการตั้งค่ารูปแบบฟอร์ม
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: LIVE PREVIEW (Mini Sheet) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse" />
            ตัวอย่างเอกสารจริงตามค่าที่ตั้งไว้ (Live Layout Preview)
          </span>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-lg text-slate-800 text-[8px] leading-relaxed relative flex flex-col justify-between" style={{ minHeight: "440px" }}>
            
            {/* Header section */}
            <div>
              <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                <div className="text-left">
                  <h4 className="font-extrabold text-[9px] uppercase" style={{ color: themeColor }}>IKM TESTING (THAILAND)</h4>
                  <p className="text-[7px] text-slate-500">155/167 Moo 5, Rayong Province 21130</p>
                </div>
                <div className="text-right">
                  <div className="bg-slate-100 rounded border flex items-center justify-center p-1 font-bold text-slate-400 select-none" style={{ height: logoSize, width: "70px" }}>
                    LOGO ({logoSize})
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-3">
                <h3 className="font-extrabold tracking-widest text-black border-b border-black inline-block pb-0.5" style={{ fontSize: titleSize }}>
                  QUOTATION
                </h3>
              </div>

              {/* Metadata columns */}
              <div className="grid grid-cols-2 gap-4 text-[7px] mb-3">
                <div className="space-y-0.5">
                  <p><strong>To:</strong> STP&I Company Limited</p>
                  <p><strong>Attn:</strong> Khun Sawit Kong-ngoen</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p><strong>Our Ref:</strong> QT-2601002-R1</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              {/* Table section */}
              <div className="mb-3">
                <table className="w-full border-collapse" style={{ border: borderStyle !== "horizontal" ? "1px solid black" : "none" }}>
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className={`p-1 text-center ${borderStyle === "grid" ? "border" : "border-r"} border-slate-400`}>ITEM</th>
                      <th className={`p-1 text-left ${borderStyle === "grid" ? "border" : ""}`}>DESCRIPTION</th>
                      <th className={`p-1 text-right ${borderStyle === "grid" ? "border" : "border-l"} border-slate-400`}>TOTAL PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${borderStyle === "grid" ? "border-b border-slate-300" : "border-none"} bg-white`}>
                      <td className={`p-1 text-center font-mono ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}>1</td>
                      <td className={`p-1 text-left ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}>Air compressor maintenance package</td>
                      <td className="p-1 text-right font-mono font-bold">฿120,000.00</td>
                    </tr>
                    <tr className={`border-b ${borderStyle === "grid" ? "border-b border-slate-300" : "border-none"} bg-slate-50`}>
                      <td className={`p-1 text-center font-mono ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}>2</td>
                      <td className={`p-1 text-left ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}>On-site technical supply (3 days)</td>
                      <td className="p-1 text-right font-mono font-bold">฿45,000.00</td>
                    </tr>
                    {/* *** LAST ENTRY *** */}
                    <tr className="bg-white font-bold text-slate-400 text-[6px]">
                      <td className={`p-1 text-center ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}></td>
                      <td className={`p-1 text-center ${borderStyle === "grid" ? "border-r border-slate-300" : ""}`}>*** LAST ENTRY ***</td>
                      <td className="p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4 text-[7px]">
                {/* Authorizer */}
                <div className="flex flex-col justify-between h-[65px] border-r border-slate-100 pr-2">
                  <div className="text-slate-500">Prepared by:</div>
                  <div className="relative">
                    {savedSignature ? (
                      <img 
                        src={savedSignature} 
                        alt="Signature Preview" 
                        className="h-[32px] object-contain max-w-full bg-slate-50/50 rounded p-0.5 mx-auto opacity-95 transition"
                      />
                    ) : (
                      <div className="h-[32px] flex items-center justify-center text-slate-300 text-[6px] italic border border-dashed rounded">
                        ไม่มีลายมือชื่อที่บันทึกไว้
                      </div>
                    )}
                    <div className="border-t border-slate-300 pt-0.5 mt-1">
                      <p className="font-extrabold text-slate-800">IKM Testing (Thailand) Co., Ltd.</p>
                    </div>
                  </div>
                </div>

                {/* Client acceptance stamp box */}
                <div className="flex flex-col justify-between h-[65px] pl-2">
                  <div className="font-semibold text-slate-800">Confirmed & Accepted:</div>
                  {showStamp ? (
                    <div className="border border-dashed border-slate-300 rounded p-1 text-center text-slate-400 text-[5px] flex items-center justify-center h-[32px] flex-col">
                      <span>SIGNATURE & COMPANY STAMP</span>
                      <span className="text-[4px] mt-0.5">DATE: __________________</span>
                    </div>
                  ) : (
                    <div className="h-[32px] flex items-end">
                      <div className="border-b border-slate-300 w-full mb-1"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Micro watermark */}
            <div className="absolute top-2 right-2 text-[6px] text-slate-300 uppercase select-none font-mono tracking-wider bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
              A4 Print Preview
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
