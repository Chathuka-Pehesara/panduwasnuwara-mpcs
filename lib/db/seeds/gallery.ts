import { supabase } from '@/lib/supabase';

export async function seedGallery(): Promise<void> {
  const { count, error } = await supabase
    .from('gallery_posts')
    .select('*', { count: 'exact', head: true });

  if (error || (count !== null && count > 0)) {
    return;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  await supabase.from('gallery_posts').insert([
    { id: 'gallery-1', image_src: '/images/gallery/coop-annual-meeting.jpg', aspect_ratio: '4:3', likes_count: 24, created_at: oneDayAgo },
    { id: 'gallery-2', image_src: '/images/gallery/coop-community-award.jpg', aspect_ratio: '4:3', likes_count: 38, created_at: now }
  ]);

  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  await supabase.from('gallery_comments').insert([
    { id: 'c-1', post_id: 'gallery-1', author: 'Sunil Jayawardena', text: 'පඬුවස්නුවර සමුපකාර මහා සභා රැස්වීම සහ විශිෂ්ටතා සම්මාන ප්‍රදානය — ඉතාමත් ආඩම්බර මොහොතක්!', created_at: twelveHoursAgo },
    { id: 'c-2', post_id: 'gallery-1', author: 'Kamani Silva', text: 'Congratulations to all our committee members and recipients!', created_at: sixHoursAgo },
    { id: 'c-3', post_id: 'gallery-2', author: 'Bandara Herath', text: 'ප්‍රජා සත්කාරක සහ ග්‍රාමීය බැංකු සේවාවන් අගය කිරීම ඉතා වටිනවා.', created_at: twoHoursAgo }
  ]);
}
