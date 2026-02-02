'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Search,
  Filter,
  Image,
  File,
  FileVideo,
  FileAudio,
  Loader2,
  RefreshCw,
  Paperclip,
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  message_id: string;
  grant_id: string;
  email_subject?: string;
  email_from?: string;
  email_date?: string;
}

type FileTypeFilter = 'all' | 'images' | 'documents' | 'pdfs' | 'videos' | 'audio';

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all');

  useEffect(() => {
    fetchAttachments();
  }, [fileTypeFilter]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fileTypeFilter !== 'all') {
        params.append('type', fileTypeFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/attachments?${params.toString()}`);
      const data = await response.json();

      if (data.attachments) {
        setAttachments(data.attachments);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAttachments();
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      setDownloading(attachment.id);
      const response = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: attachment.message_id,
          attachmentId: attachment.id,
          grantId: attachment.grant_id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.downloadUrl) {
        // Open download URL in new tab
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Failed to download attachment');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download attachment');
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (contentType: string) => {
    const type = contentType.toLowerCase();
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    return File;
  };

  const getFileTypeColor = (contentType: string) => {
    const type = contentType.toLowerCase();
    if (type.startsWith('image/')) return 'text-blue-500';
    if (type.includes('pdf')) return 'text-red-500';
    if (type.startsWith('video/')) return 'text-purple-500';
    if (type.startsWith('audio/')) return 'text-green-500';
    return 'text-gray-500';
  };

  const filters: { value: FileTypeFilter; label: string; icon: any }[] = [
    { value: 'all', label: 'All Files', icon: Paperclip },
    { value: 'images', label: 'Images', icon: Image },
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'pdfs', label: 'PDFs', icon: FileText },
    { value: 'videos', label: 'Videos', icon: FileVideo },
    { value: 'audio', label: 'Audio', icon: FileAudio },
  ];

  const stats = {
    total: attachments.length,
    totalSize: attachments.reduce((sum, att) => sum + att.size, 0),
    images: attachments.filter((a) => a.content_type.startsWith('image/')).length,
    documents: attachments.filter((a) =>
      a.content_type.includes('document') || a.content_type.includes('text')
    ).length,
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Attachments</h1>
          <p className="text-muted-foreground">All your email attachments in one place</p>
        </div>
        <Button variant="outline" onClick={fetchAttachments} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attachments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.value}
                variant={fileTypeFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFileTypeFilter(filter.value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Attachments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : attachments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No attachments found</h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery || fileTypeFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Email attachments will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.content_type);
            const iconColor = getFileTypeColor(attachment.content_type);

            return (
              <Card key={`${attachment.message_id}-${attachment.id}`} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileIcon className={`h-6 w-6 flex-shrink-0 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {attachment.filename}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {formatFileSize(attachment.size)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Email Info */}
                  <div className="space-y-1 text-xs">
                    <div className="truncate">
                      <span className="text-muted-foreground">From:</span>{' '}
                      <span className="font-medium">{attachment.email_from}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-muted-foreground">Subject:</span>{' '}
                      <span>{attachment.email_subject}</span>
                    </div>
                    {attachment.email_date && (
                      <div className="text-muted-foreground">
                        {formatDate(new Date(attachment.email_date))}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloading === attachment.id}
                  >
                    {downloading === attachment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
