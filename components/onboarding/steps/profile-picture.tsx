'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, User, Loader2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';

interface ProfilePictureStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: () => void;
  saving?: boolean;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper function to create image from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Helper function to get cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob as Blob);
    }, 'image/jpeg', 0.95);
  });
}

export function ProfilePictureStep({ data, onNext, onBack }: ProfilePictureStepProps) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load existing profile picture on mount
  useEffect(() => {
    const loadExistingPhoto = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get user profile from database
        const { data: userData } = (await supabase
          .from('users')
          .select('profile_picture_url')
          .eq('id', user.id)
          .single()) as { data: { profile_picture_url: string | null } | null };

        if (userData?.profile_picture_url) {
          setExistingPhotoUrl(userData.profile_picture_url);
        }
      } catch (error) {
        console.error('Error loading profile picture:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingPhoto();
  }, [supabase]);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setShowEditor(true);
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleUpload = async () => {
    // If user has existing photo and hasn't selected a new one, just continue
    if (!imageSrc && existingPhotoUrl) {
      onNext({ profile_picture_uploaded: true, profile_picture_url: existingPhotoUrl });
      return;
    }

    if (!imageSrc || !croppedAreaPixels) {
      // Skip this step
      onNext({ profile_picture_uploaded: false });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Get cropped image
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      // Upload to Supabase Storage
      const fileName = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, croppedImage, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image');
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await (supabase
        .from('users') as any)
        .update({
          profile_picture_url: publicUrl,
          profile_picture_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update profile');
        setUploading(false);
        return;
      }

      toast.success('Profile picture uploaded!');
      onNext({ profile_picture_uploaded: true, profile_picture_url: publicUrl });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">
            {existingPhotoUrl ? 'Update Your Profile Picture' : 'Add a Profile Picture'}
          </h1>
          <p className="text-muted-foreground">
            {existingPhotoUrl
              ? 'You already have a profile picture. Upload a new one or continue.'
              : 'Help your team recognize you by adding a profile picture'}
          </p>
        </div>

        {!showEditor ? (
          // Initial upload view
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg">
                {existingPhotoUrl ? (
                  <img
                    src={existingPhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload button */}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Photo
            </Button>

            <p className="text-xs text-gray-500 text-center max-w-xs">
              Recommended: Square image, at least 400x400px
              <br />
              Max file size: 10MB
            </p>
          </div>
        ) : (
          // Editor view
          <div className="space-y-6">
            {/* Cropper */}
            <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc!}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Zoom slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  className="w-full"
                />
              </div>

              {/* Rotate button */}
              <Button
                variant="outline"
                onClick={handleRotate}
                className="w-full"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate 90°
              </Button>

              {/* Change photo button */}
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditor(false);
                  setImageSrc(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Different Photo
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={uploading}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={uploading || (showEditor && !croppedAreaPixels)}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : imageSrc ? (
              'Upload & Continue'
            ) : existingPhotoUrl ? (
              'Continue'
            ) : (
              'Skip for Now'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
