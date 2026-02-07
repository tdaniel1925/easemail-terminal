'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ProfilePictureStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: () => void;
  saving?: boolean;
}

export function ProfilePictureStep({ data, onNext, onBack }: ProfilePictureStepProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
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

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
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

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Add a Profile Picture</h1>
          <p className="text-muted-foreground">
            Help your team recognize you by adding a profile picture
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
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
              disabled={uploading}
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
            disabled={uploading}
            className="w-full max-w-xs"
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFile ? 'Change Photo' : 'Choose Photo'}
          </Button>

          <p className="text-xs text-gray-500 text-center max-w-xs">
            Recommended: Square image, at least 400x400px
            <br />
            Max file size: 5MB
          </p>
        </div>

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
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : selectedFile ? (
              'Upload & Continue'
            ) : (
              'Skip for Now'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
