"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, Upload, X, Loader2, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  Smartphone, ClipboardList, Camera, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import OTPVerification from './OTPVerification';

export default function DriverSignup({ onBack, onComplete }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Docs, 3: Vehicle, 4: OTP
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', cnicNumber: '',
    contact1: '', contact2: '', paymentMethod: 'Easypaisa',
    accountNumber: '', vehicleModel: '', licensePlate: '',
  });

  const [files, setFiles] = useState({
    cnicFront: null, cnicBack: null, license: null,
    carDocs: null, carImages: [] 
  });

  const [previews, setPreviews] = useState({
    cnicFront: null, cnicBack: null, license: null,
    carDocs: null, carImages: []
  });

  // --- FILE HANDLERS ---
  const handleSingleFile = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleMultipleCarImages = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.carImages.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setFiles(prev => ({ ...prev, carImages: [...prev.carImages, ...selectedFiles] }));
    setPreviews(prev => ({ ...prev, carImages: [...prev.carImages, ...newPreviews] }));
  };

  const removeCarImage = (index) => {
    setFiles(prev => ({ ...prev, carImages: prev.carImages.filter((_, i) => i !== index) }));
    setPreviews(prev => ({ ...prev, carImages: prev.carImages.filter((_, i) => i !== index) }));
  };

  // --- VALIDATION ---
  const validateStep = () => {
    if (step === 1) {
      const { fullName, email, password, cnicNumber, contact1, accountNumber } = formData;
      if (!fullName || !email || !password || !cnicNumber || !contact1 || !accountNumber) {
        toast.error("Complete all personal and payout fields");
        return false;
      }
    } else if (step === 2) {
      if (!files.cnicFront || !files.cnicBack || !files.license || !files.carDocs) {
        toast.error("Upload all required documents");
        return false;
      }
    } else if (step === 3) {
      if (!formData.vehicleModel || !formData.licensePlate || files.carImages.length < 2) {
        toast.error("Vehicle info and min 2 photos required");
        return false;
      }
    }
    return true;
  };

  // --- BACKEND INTERACTIONS ---
  const triggerOTPRequest = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      // 🎯 FIXED URL INTERFACES FOR LIVE PRODUCTION ROUTING
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Could not send verification email");
      }

      toast.success("Verification code sent to your inbox!");
      setStep(4); 
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("Uploading documents and finalizing profile...");
    
    try {
      const data = new FormData();
      
      // Text Fields
      data.append("username", formData.fullName);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("cnicNumber", formData.cnicNumber);
      data.append("contact1", formData.contact1);
      data.append("contact2", formData.contact2 || "");
      data.append("paymentMethod", formData.paymentMethod);
      data.append("accountNumber", formData.accountNumber);
      data.append("vehicleModel", formData.vehicleModel);
      data.append("licensePlate", formData.licensePlate);
      
      // Single Files
      data.append("cnicFront", files.cnicFront);
      data.append("cnicBack", files.cnicBack);
      data.append("license", files.license);
      data.append("carDocs", files.carDocs);

      // Multiple Vehicle Images
      files.carImages.forEach(file => {
        data.append("carImages", file);
      });

      // 🎯 FIXED URL INTERFACES FOR LIVE PRODUCTION ROUTING
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-driver`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
      }

      toast.success("Application submitted successfully!", { id: toastId });
      onComplete(); 
    } catch (err) {
      toast.error(err.message, { id: toastId });
      setStep(3); 
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER OTP VIEW ---
  if (step === 4) {
    return (
      <OTPVerification 
        email={formData.email} 
        onVerified={handleFinalSubmit} 
        onBack={() => setStep(3)}
        isSubmitting={loading}
      />
    );
  }

  return (
    <div className="w-full max-w-[550px] bg-white rounded-[40px] shadow-2xl border border-emerald-100/50 overflow-hidden transition-all duration-500">
      {/* Progress Header */}
      <div className="pt-8 pb-4 px-10 bg-emerald-50/30 border-b border-emerald-100/50">
        <div className="flex justify-between items-center mb-6">
          <button type="button" onClick={step === 1 ? onBack : () => setStep(s => s - 1)} className="p-2 hover:bg-white rounded-full transition-colors text-emerald-600">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 leading-none">Driver Registration</h2>
            <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mt-1">Step {step} of 3</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-500' : 'bg-emerald-200/50'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={triggerOTPRequest} className="p-8">
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <InputField label="Full Name" value={formData.fullName} placeholder="As per CNIC" onChange={v => setFormData({...formData, fullName: v})} />
            <InputField label="Email Address" value={formData.email} placeholder="pilot@glaciago.com" onChange={v => setFormData({...formData, email: v})} />
            <InputField label="Account Password" value={formData.password} type="password" placeholder="••••••••" onChange={v => setFormData({...formData, password: v})} />
            <InputField label="CNIC Number" value={formData.cnicNumber} placeholder="42101-XXXXXXX-X" onChange={v => setFormData({...formData, cnicNumber: v})} />
            <div className="grid grid-cols-2 gap-4">
              <PrimaryContactField label="Primary Contact" value={formData.contact1} placeholder="03XX-XXXXXXX" onChange={v => setFormData({...formData, contact1: v})} />
              <InputField label="Secondary (Opt)" value={formData.contact2} placeholder="03XX-XXXXXXX" onChange={v => setFormData({...formData, contact2: v})} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <select 
                  value={formData.paymentMethod}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none cursor-pointer"
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option>Easypaisa</option><option>JazzCash</option><option>Bank Account</option>
                </select>
                <input 
                  value={formData.accountNumber}
                  placeholder="Account Number" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                />
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <UploadSlot id="cnicF" label="CNIC Front" preview={previews.cnicFront} onUpload={e => handleSingleFile(e, 'cnicFront')} />
            <UploadSlot id="cnicB" label="CNIC Back" preview={previews.cnicBack} onUpload={e => handleSingleFile(e, 'cnicBack')} />
            <UploadSlot id="lic" label="License" preview={previews.license} icon={<ShieldCheck size={20}/>} onUpload={e => handleSingleFile(e, 'license')} />
            <UploadSlot id="docs" label="Car Docs" preview={previews.carDocs} icon={<ClipboardList size={20}/>} onUpload={e => handleSingleFile(e, 'carDocs')} />
          </div>
        )}

        {/* Step 3: Vehicle */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Vehicle Model" value={formData.vehicleModel} placeholder="Toyota Corolla" onChange={v => setFormData({...formData, vehicleModel: v})} />
              <InputField label="Plate #" value={formData.licensePlate} placeholder="ABC-123" onChange={v => setFormData({...formData, licensePlate: v})} />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {previews.carImages.map((src, i) => (
                  <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-emerald-100 group">
                    <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button type="button" onClick={() => removeCarImage(i)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
                {previews.carImages.length < 6 && (
                  <label className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer transition-all">
                    <Camera size={20} className="text-slate-300" />
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleMultipleCarImages} />
                  </label>
                )}
            </div>
          </div>
        )}

        <div className="mt-8">
          {step < 3 ? (
            <button type="button" onClick={() => { if(validateStep()) setStep(s => s + 1) }} className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] text-white bg-emerald-600 shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase">
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] text-white bg-emerald-600 shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase">
              {loading ? <Loader2 className="animate-spin" /> : <>Send Verification Code <Mail size={18} /></>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function InputField({ label, value, placeholder, onChange, type="text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
      />
    </div>
  );
}

function PrimaryContactField({ label, value, placeholder, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-bold text-slate-700"
      />
    </div>
  );
}

function UploadSlot({ id, label, preview, onUpload, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">{label}</label>
      <div className="relative h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all overflow-hidden">
        <input type="file" id={id} className="hidden" onChange={onUpload} accept="image/*" />
        <label htmlFor={id} className="w-full h-full flex items-center justify-center cursor-pointer group">
          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Replace</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                {icon || <Smartphone />}
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}