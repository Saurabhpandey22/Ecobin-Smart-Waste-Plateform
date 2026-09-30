import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, Camera } from 'lucide-react';
import { api } from '../services/api';

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "Upload Photo from Device", 
  helpText = "PNG, JPG, WEBP up to 15MB",
  presetSamples = [] 
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await processAndUploadFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    await processAndUploadFile(file);
  };

  const processAndUploadFile = async (file) => {
    try {
      setError('');
      setUploading(true);

      // Validate image type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        setUploading(false);
        return;
      }

      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Box / Image Preview */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900 group shadow-md">
          <img
            src={value}
            alt="Uploaded Evidence Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center space-x-1.5 text-emerald-300 font-bold text-xs backdrop-blur-md px-3 py-1 rounded-xl bg-black/50 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Photo Attached</span>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md flex items-center space-x-1 text-xs"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
              <span>Change Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 group"
        >
          {uploading ? (
            <div className="py-4 space-y-2 text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
              <p className="text-xs font-extrabold">Uploading photo from device to server...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Click to Browse or Drag & Drop Photo Here
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  {helpText}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-500 font-bold">⚠️ {error}</p>
      )}

      {/* Preset Demo Samples if available */}
      {presetSamples.length > 0 && !value && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Or Choose Demo Sample:</span>
          {presetSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(sample.url)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
