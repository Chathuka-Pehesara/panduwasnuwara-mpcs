import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { supabase } from '@/lib/supabase';
import {
  getGalleryPosts,
  togglePostLike,
  addGalleryComment,
  deleteGalleryComment,
  createGalleryPost,
  updateGalleryPost,
  deleteGalleryPost
} from '@/lib/models/gallery';

function getAuthUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('mpcs_auth_token')?.value || req.cookies.get('mpcs_admin_token')?.value;
  if (!token) return null;

  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
      return { username, role, isAdmin: role === 'admin' };
    }
  } catch (err) {
    console.error('Error parsing token:', err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authUser = getAuthUserFromRequest(req);
    const clientId = authUser ? authUser.username : (searchParams.get('clientId') || '');

    const posts = await getGalleryPosts(clientId);

    return NextResponse.json({
      success: true,
      posts,
      currentUser: authUser
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching gallery posts:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);
    const contentType = req.headers.get('content-type') || '';

    // Multipart Form Upload for Admin Gallery Item Creation
    if (contentType.includes('multipart/form-data')) {
      if (!authUser || !authUser.isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
      }

      const formData = await req.formData();
      const rawId = formData.get('id') as string;
      const customId = rawId ? rawId.trim() : undefined;
      const aspectRatio = (formData.get('aspect_ratio') as string) || '4:3';
      let imageSrc = (formData.get('image_src') as string) || '';

      const file = formData.get('image') as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let ext = path.extname(file.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
          ext = '.jpg';
        }

        const safeFilename = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const storagePath = `gallery/${safeFilename}`;

        // 1. Try Supabase Storage
        try {
          const mimeType = file.type || 'image/jpeg';
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage
              .from('uploads')
              .getPublicUrl(storagePath);
            if (pubData?.publicUrl) {
              imageSrc = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase gallery storage error:', storageErr);
        }

        // 2. Fallback to local or data URL
        if (!imageSrc) {
          try {
            const uploadDir = path.join(process.cwd(), 'public', 'images', 'gallery');
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, safeFilename);
            await fs.writeFile(filePath, buffer);
            imageSrc = `/images/gallery/${safeFilename}`;
          } catch (fsErr) {
            const mimeType = file.type || 'image/jpeg';
            imageSrc = `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      }

      if (!imageSrc) {
        return NextResponse.json({ success: false, error: 'Image file or image URL is required' }, { status: 400 });
      }

      const post = await createGalleryPost({
        id: customId,
        image_src: imageSrc,
        aspect_ratio: aspectRatio
      });

      return NextResponse.json({
        success: true,
        message: 'Gallery item created successfully',
        post
      });
    }

    // JSON Payload
    if (!authUser) {
      return NextResponse.json({
        success: false,
        requireLogin: true,
        error: 'Please sign in to react or leave comments'
      }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // Admin Create Gallery Post via JSON URL
    if (action === 'create_post') {
      if (!authUser.isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
      }

      const { image_src, aspect_ratio, id } = body;
      if (!image_src?.trim()) {
        return NextResponse.json({ success: false, error: 'Image source is required' }, { status: 400 });
      }

      const post = await createGalleryPost({
        id: id?.trim(),
        image_src: image_src.trim(),
        aspect_ratio: aspect_ratio || '4:3'
      });

      return NextResponse.json({
        success: true,
        message: 'Gallery item created successfully',
        post
      });
    }

    // Toggle reaction
    if (action === 'react') {
      const { postId } = body;
      const clientId = authUser.username;

      if (!postId) {
        return NextResponse.json({ success: false, error: 'Missing postId' }, { status: 400 });
      }

      const result = await togglePostLike(postId, clientId);
      return NextResponse.json({
        success: true,
        liked: result.liked,
        likesCount: result.likesCount
      });
    }

    // Add comment
    if (action === 'comment') {
      const { postId, text } = body;
      const author = authUser.username;

      if (!postId || !text?.trim()) {
        return NextResponse.json({ success: false, error: 'Missing required comment fields' }, { status: 400 });
      }

      const comment = await addGalleryComment(postId, author, text);
      return NextResponse.json({ success: true, comment });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling gallery post request:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let postId = '';
    let imageSrc: string | undefined;
    let aspectRatio: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      postId = (formData.get('id') as string) || '';
      aspectRatio = (formData.get('aspect_ratio') as string) || undefined;
      const rawImageSrc = (formData.get('image_src') as string) || '';
      if (rawImageSrc.trim()) imageSrc = rawImageSrc.trim();

      const file = formData.get('image') as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let ext = path.extname(file.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
          ext = '.jpg';
        }

        const safeFilename = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const storagePath = `gallery/${safeFilename}`;

        // 1. Try Supabase Storage
        try {
          const mimeType = file.type || 'image/jpeg';
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage
              .from('uploads')
              .getPublicUrl(storagePath);
            if (pubData?.publicUrl) {
              imageSrc = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase gallery storage error:', storageErr);
        }

        // 2. Fallback to local or data URL
        if (!imageSrc) {
          try {
            const uploadDir = path.join(process.cwd(), 'public', 'images', 'gallery');
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, safeFilename);
            await fs.writeFile(filePath, buffer);
            imageSrc = `/images/gallery/${safeFilename}`;
          } catch (fsErr) {
            const mimeType = file.type || 'image/jpeg';
            imageSrc = `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      }
    } else {
      const body = await req.json();
      postId = body.id;
      imageSrc = body.image_src;
      aspectRatio = body.aspect_ratio;
    }

    if (!postId) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    const updated = await updateGalleryPost(postId, {
      image_src: imageSrc,
      aspect_ratio: aspectRatio
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery item updated successfully',
      post: updated
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const url = new URL(req.url);
    let postId = url.searchParams.get('postId');
    let commentId = url.searchParams.get('commentId');

    if (!postId && !commentId) {
      try {
        const body = await req.json();
        postId = body.postId;
        commentId = body.commentId;
      } catch {
        // No body
      }
    }

    // Delete Entire Gallery Post
    if (postId) {
      // Check if image file exists locally and can be unlinked
      const posts = await getGalleryPosts();
      const target = posts.find(p => p.id === postId);
      if (target?.imageSrc && target.imageSrc.startsWith('/images/gallery/gallery-')) {
        const localFilePath = path.join(process.cwd(), 'public', target.imageSrc.replace(/^\//, ''));
        try {
          await fs.unlink(localFilePath);
        } catch {
          // Ignore unlink errors
        }
      }

      const success = await deleteGalleryPost(postId);
      if (!success) {
        return NextResponse.json({ success: false, error: 'Gallery post not found or already deleted' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Gallery post and associated comments deleted successfully'
      });
    }

    // Delete Single Comment
    if (commentId) {
      const success = await deleteGalleryComment(commentId);
      if (!success) {
        return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Missing postId or commentId' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in gallery delete request:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
