import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils.js';

/**
 * Props:
 *  previewUrl  — current image URL to show (e.g. existing Supabase public URL)
 *  onPick(blob)— called with a freshly compressed Blob ready for upload
 *  onClear()   — called when the user removes the photo
 *  error       — optional error string
 */
export default function ImageUploader({ previewUrl, onPick, onClear, error }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function handleFile(file) {
    if (!file) return;
    setLocalError(null);
    setBusy(true);
    try {
      const blob = await compressImageFile(file);
      if (localPreview) URL.revokeObjectURL(localPreview);
      const url = URL.createObjectURL(blob);
      setLocalPreview(url);
      onPick(blob);
    } catch (err) {
      setLocalError(err.message || 'Could not load image');
    } finally {
      setBusy(false);
    }
  }

  function handleClear() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onClear?.();
  }

  const displayUrl = localPreview || previewUrl;

  return (
    <div>
      <label className="label">Photo *</label>
      <div
        className={
          'relative aspect-square w-full max-w-xs mx-auto rounded-3xl overflow-hidden border-2 border-dashed transition ' +
          (error || localError
            ? 'border-blush-300 bg-blush-50'
            : 'border-lavender-200 bg-lavender-50/50 hover:border-lavender-400')
        }
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-blush-500 flex items-center justify-center"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-lavender-500 p-4 text-center">
            {busy ? (
              <Loader2 className="animate-spin" size={32} />
            ) : (
              <>
                <ImageIcon size={32} className="mb-2" />
                <div className="text-sm">No photo selected</div>
                <div className="text-xs text-lavender-400 mt-1">Tap to upload</div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3 justify-center">
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Upload size={16} /> Choose
        </button>
        <button
          type="button"
          className="btn-secondary text-sm sm:hidden"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
        >
          <Camera size={16} /> Camera
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {(error || localError) && (
        <p className="text-xs text-blush-600 mt-2 text-center">{localError || error}</p>
      )}
    </div>
  );
}
