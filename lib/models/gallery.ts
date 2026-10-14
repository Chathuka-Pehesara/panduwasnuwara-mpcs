import { supabase } from '@/lib/supabase';
import { GalleryPost, GalleryComment } from '@/lib/types';

export async function getGalleryPosts(clientId?: string): Promise<GalleryPost[]> {
  const { data: posts, error: postsError } = await supabase
    .from('gallery_posts')
    .select('id, image_src, aspect_ratio, likes_count, description, created_at')
    .order('created_at', { ascending: true });

  if (postsError) {
    // Graceful fallback if description column does not exist yet
    const { data: fallbackPosts } = await supabase
      .from('gallery_posts')
      .select('id, image_src, aspect_ratio, likes_count, created_at')
      .order('created_at', { ascending: true });
    if (!fallbackPosts) return [];
    return (fallbackPosts || []).map(p => ({
      id: p.id,
      imageSrc: p.image_src,
      aspectRatio: p.aspect_ratio,
      likesCount: p.likes_count,
      hasLiked: false,
      comments: [],
      description: null
    }));
  }

  const { data: comments, error: commentsError } = await supabase
    .from('gallery_comments')
    .select('id, post_id, author, text, created_at')
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching gallery comments from Supabase:', commentsError);
  }

  let userLikedPostIds = new Set<string>();
  if (clientId) {
    const { data: userLikes } = await supabase
      .from('gallery_likes')
      .select('post_id')
      .eq('client_id', clientId);

    userLikedPostIds = new Set((userLikes || []).map(l => l.post_id));
  }

  const commentsByPost: Record<string, GalleryComment[]> = {};
  for (const c of comments || []) {
    if (!commentsByPost[c.post_id]) {
      commentsByPost[c.post_id] = [];
    }
    commentsByPost[c.post_id].push(c);
  }

  return (posts || []).map(p => ({
    id: p.id,
    imageSrc: p.image_src,
    aspectRatio: p.aspect_ratio,
    likesCount: p.likes_count,
    hasLiked: userLikedPostIds.has(p.id),
    comments: commentsByPost[p.id] || [],
    description: p.description || null
  }));
}

export async function togglePostLike(postId: string, clientId: string): Promise<{ liked: boolean; likesCount: number }> {
  const { data: existing } = await supabase
    .from('gallery_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('client_id', clientId);

  const isAlreadyLiked = (existing || []).length > 0;

  const { data: currentPost } = await supabase
    .from('gallery_posts')
    .select('likes_count')
    .eq('id', postId)
    .single();

  const currentLikes = currentPost?.likes_count || 0;

  if (isAlreadyLiked) {
    await supabase
      .from('gallery_likes')
      .delete()
      .eq('post_id', postId)
      .eq('client_id', clientId);

    const newCount = Math.max(0, currentLikes - 1);
    await supabase
      .from('gallery_posts')
      .update({ likes_count: newCount })
      .eq('id', postId);

    return { liked: false, likesCount: newCount };
  } else {
    await supabase
      .from('gallery_likes')
      .insert({ post_id: postId, client_id: clientId });

    const newCount = currentLikes + 1;
    await supabase
      .from('gallery_posts')
      .update({ likes_count: newCount })
      .eq('id', postId);

    return { liked: true, likesCount: newCount };
  }
}

export async function addGalleryComment(postId: string, author: string, text: string): Promise<GalleryComment> {
  const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const { data, error } = await supabase
    .from('gallery_comments')
    .insert({
      id: commentId,
      post_id: postId,
      author: author,
      text: text.trim().slice(0, 500)
    })
    .select('id, post_id, author, text, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to add comment');
  }

  return data;
}

export async function deleteGalleryComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('gallery_comments')
    .delete()
    .eq('id', commentId);

  return !error;
}

export interface CreateGalleryPostInput {
  id?: string;
  image_src: string;
  aspect_ratio?: string;
  description?: string | null;
}

export async function createGalleryPost(data: CreateGalleryPostInput): Promise<GalleryPost> {
  const postId = data.id || `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const aspectRatio = data.aspect_ratio || '4:3';
  const description = data.description ? data.description.trim() : null;

  let inserted: any = null;

  // Try insert with description
  const { data: res1, error: err1 } = await supabase
    .from('gallery_posts')
    .insert({
      id: postId,
      image_src: data.image_src,
      aspect_ratio: aspectRatio,
      likes_count: 0,
      description
    })
    .select('id, image_src, aspect_ratio, likes_count, description, created_at')
    .single();

  if (!err1 && res1) {
    inserted = res1;
  } else {
    // Fallback if description column not added yet
    const { data: res2, error: err2 } = await supabase
      .from('gallery_posts')
      .insert({
        id: postId,
        image_src: data.image_src,
        aspect_ratio: aspectRatio,
        likes_count: 0
      })
      .select('id, image_src, aspect_ratio, likes_count, created_at')
      .single();

    if (err2 || !res2) {
      throw new Error(err2?.message || err1?.message || 'Failed to create gallery post');
    }
    inserted = { ...res2, description: null };
  }

  return {
    id: inserted.id,
    imageSrc: inserted.image_src,
    aspectRatio: inserted.aspect_ratio,
    likesCount: inserted.likes_count,
    hasLiked: false,
    comments: [],
    description: inserted.description || null
  };
}

export interface UpdateGalleryPostInput {
  image_src?: string;
  aspect_ratio?: string;
  description?: string | null;
}

export async function updateGalleryPost(id: string, data: UpdateGalleryPostInput): Promise<GalleryPost | null> {
  const updatePayload: any = {};
  if (data.image_src !== undefined) updatePayload.image_src = data.image_src;
  if (data.aspect_ratio !== undefined) updatePayload.aspect_ratio = data.aspect_ratio;
  if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;

  let updated: any = null;

  const { data: res1, error: err1 } = await supabase
    .from('gallery_posts')
    .update(updatePayload)
    .eq('id', id)
    .select('id, image_src, aspect_ratio, likes_count, description, created_at')
    .single();

  if (!err1 && res1) {
    updated = res1;
  } else {
    // If description column caused error, remove it and update remaining
    delete updatePayload.description;
    const { data: res2, error: err2 } = await supabase
      .from('gallery_posts')
      .update(updatePayload)
      .eq('id', id)
      .select('id, image_src, aspect_ratio, likes_count, created_at')
      .single();

    if (err2 || !res2) {
      console.error('Error updating gallery post in Supabase:', err2 || err1);
      return null;
    }
    updated = { ...res2, description: null };
  }

  const { data: comments } = await supabase
    .from('gallery_comments')
    .select('id, post_id, author, text, created_at')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  return {
    id: updated.id,
    imageSrc: updated.image_src,
    aspectRatio: updated.aspect_ratio,
    likesCount: updated.likes_count,
    hasLiked: false,
    comments: comments || [],
    description: updated.description || null
  };
}

export async function deleteGalleryPost(id: string): Promise<boolean> {
  // Cascading deletes for likes and comments
  await supabase.from('gallery_likes').delete().eq('post_id', id);
  await supabase.from('gallery_comments').delete().eq('post_id', id);

  const { error } = await supabase
    .from('gallery_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gallery post from Supabase:', error);
    return false;
  }

  return true;
}
