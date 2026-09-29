import { supabase } from '@/lib/supabase';

export const INITIAL_NEWS = [
  {
    titleSi: 'බර වාහන සහ බෙදාහැරීම් රියදුරු පුරප්පාඩු සඳහා අයදුම්පත් කැඳවීම',
    titleEn: 'Call for Applications: Heavy Vehicle & Logistics Driver Vacancies',
    descriptionSi: `පණ්ඩුactionස්නුවර විවිධ සේවා සමූපකාර සමිතියේ තොග හා සිල්ලර බෙදාහැරීම් ජාලය සඳහා පළපුරුදු බර වාහන රියදුරන් (Heavy Vehicle Drivers) බඳවා ගැනීම සඳහා සුදුසුකම්ලත් ශ්‍රී ලාංකික පුරවැසියන්ගෙන් අයදුම්පත් කැඳවනු ලැබේ.

අවශ්‍ය සුදුසුකම්:
• වලංගු බර වාහන රියදුරු බලපත්‍රය (Heavy Vehicle Driving License).
• අදාළ ක්ෂේත්‍රයේ අවම වශයෙන් වසර 2 ක පළපුරුද්ද.
• පිරිසිදු රිය ධාවන වාර්තාව සහ යහපත් චරිතය.
• වයස අවුරුදු 25 - 45 ත් අතර.

වැටුප සහ දීමනා:
සමූපකාර සේවා කොමිෂන් සභා චක්‍රලේඛ අනුව ආකර්ශනීය මූලික වැටුපක්, අතිකාල (OT) සහ සුභසාධන ප්‍රතිලාභ හිමිවේ.

අයදුම් කළ යුතු ආකාරය:
ඔබගේ ජීව දත්ත පත්‍රිකාව (CV) සහ රියදුරු බලපත්‍රයේ පිටපතක් සමඟ ප්‍රධාන කාර්යාලයට (කුරුණෑගල පාර, හැට්ටිපොල) පැමිණ හෝ විද්‍යුත් තැපෑල (panduwasnuwara@mpcs.lk) මගින් යොමු කරන්න. වැඩිදුර විස්තර සඳහා අමතන්න: 037 229 1011 / 076 424 7716.`,
    descriptionEn: `Panduwasnuwara Multi-Purpose Co-operative Society (MPCS) invites applications from energetic, experienced, and qualified Sri Lankan citizens for the post of Heavy Vehicle & Distribution Drivers for our logistics and retail distribution network.

Key Requirements:
• Valid Sri Lankan Heavy Vehicle Driving License.
• Minimum 2 years of proven commercial / logistics driving experience.
• Clean driving record and certified good conduct.
• Age between 25 and 45 years.

Remuneration & Benefits:
Attractive basic salary in accordance with Co-operative Service Commission circulars, overtime allowances, medical assistance, and statutory cooperative welfare benefits.

How to Apply:
Submit your CV along with copies of your driving license and NIC to the Panduwasnuwara MPCS Head Office, Kurunegala Rd, Hettipola, or email to panduwasnuwara@mpcs.lk. For inquiries, call: 037 229 1011 / 076 424 7716.`,
    imageUrl: '/images/news/driver-vacancy.jpg',
    category: 'vacancy',
    badgeTextSi: 'රැකියා ඇබෑර්තු',
    badgeTextEn: 'Job Vacancy',
    isPinned: true,
    isPublished: true
  },
  {
    titleSi: '48 වන වාර්ෂික මහා සභා රැස්වීම සහ සාමාජික ලාභාංශ බෙදාහැරීම පිළිබඳ නිවේදනය',
    titleEn: 'Notice of 48th Annual General Meeting & Member Dividend Distribution',
    descriptionSi: `පණ්ඩුactionස්නුවර විවිධ සේවා සමූපකාර සමිතියේ 48 වන වාර්ෂික මහා සභා රැස්වීම එළඹෙන මස සමිති ප්‍රධාන ශ්‍රවණාගාරයේදී පැවැත්වේ. සමිතියේ සියලුම ලියාපදිංචි ගරු සාමාජික භවතුන් වෙත මෙයින් ගෞරවයෙන් දැනුම් දෙනු ලැබේ.

විශේෂාංග:
• පසුගිය මුදල් වර්ෂයේ වාර්ෂික ගිණුම් වාර්තාව සභාගත කිරීම.
• සාමාජික ලාභාංශ හා ප්‍රසාද දීමනා අනුමත කිරීම හා බෙදාහැරීම ආරම්භ කිරීම.
• විශිෂ්ටතම සාමාජික හා ව්‍යාපාරික ඇගයීම් සම්මාන ප්‍රදානය.

සියලුම සාමාජිකයින්ට නියමිත වේලාවට සහභාගී වන මෙන් කාරුණිකව ඉල්ලා සිටිමු.`,
    descriptionEn: `The 48th Annual General Meeting of the Panduwasnuwara Multi-Purpose Co-operative Society will be held at the MPCS Main Auditorium, Hettipola. All registered and respected members are cordially invited to attend.

Key Agenda:
• Presentation of the Audited Annual Financial Accounts and Director Board Report.
• Approval and formal commencement of annual member dividends and patronage rebates.
• Presentation of awards for excellence in agricultural and branch collaboration.

All eligible voting members are kindly requested to present their membership credentials at the reception counter.`,
    imageUrl: '/images/gallery/coop-annual-meeting.jpg',
    category: 'notice',
    badgeTextSi: 'විශේෂ නිවේදනය',
    badgeTextEn: 'Special Notice',
    isPinned: false,
    isPublished: true
  },
  {
    titleSi: '2026 යල කන්නයේ වී අස්වැන්න සහ කෘෂි නිෂ්පාදන ඉහළ මිලකට මිලදී ගැනීම',
    titleEn: 'Procurement of 2026 Yala Season Paddy & Agricultural Crops at Guaranteed Prices',
    descriptionSi: `පණ්ඩුactionස්නුවර ප්‍රාදේශීය ගොවි ප්‍රජාවගේ වී අස්වැන්න සඳහා සාධාරණ සහතික මිලක් ලබාදීමේ අරමුණින්, සමූපකාර වී ගබඩා මධ්‍යස්ථාන හරහා සෘජුවම වී සහ කෘෂි අස්වැන්න මිලදී ගැනීමේ කටයුතු දැන් ආරම්භ කර ඇත.

• තෙතමනය පාලිත උසස් ප්‍රමිතියෙන් යුතු වී සඳහා රජයේ සහතික මිලට වඩා වැඩි ආකර්ශනීය මිලක්.
• භාරගත් මොහොතේදීම ක්ෂණික ගෙවීම් (Spot Cash Payments).
• ප්‍රවාහන පහසුකම් අවශ්‍ය ගොවි මහතුන්ට විශේෂ සමූපකාර ප්‍රවාහන සේවාව.

විස්තර සඳහා ඔබේ ළඟම පිහිටි සමූපකාර ප්‍රාදේශීය ශාඛාව හෝ ග්‍රාමීය බැංකුව අමතන්න.`,
    descriptionEn: `Panduwasnuwara MPCS has officially commenced direct procurement of Yala season paddy harvest and agricultural produce through designated cooperative storage centres to protect farming families against middlemen exploitation.

• Guaranteed competitive prices above standard government baseline rates.
• Instant on-the-spot bank or cash payouts upon grain weight verification.
• Dedicated cooperative transport assistance for bulk agricultural collections.

For drop-off schedules and depot locations, please visit your nearest MPCS branch or Rural Bank counter.`,
    imageUrl: '/images/gallery/coop-community-award.jpg',
    category: 'notice',
    badgeTextSi: 'කෘෂි සේවා',
    badgeTextEn: 'Agri Services',
    isPinned: false,
    isPublished: true
  }
];

export async function seedNews(): Promise<void> {
  const { count, error } = await supabase
    .from('news_announcements')
    .select('*', { count: 'exact', head: true });

  if (error || (count !== null && count > 0)) {
    return;
  }

  const rows = INITIAL_NEWS.map(n => ({
    title_si: n.titleSi,
    title_en: n.titleEn,
    description_si: n.descriptionSi,
    description_en: n.descriptionEn,
    image_url: n.imageUrl,
    category: n.category,
    badge_text_si: n.badgeTextSi,
    badge_text_en: n.badgeTextEn,
    is_pinned: n.isPinned,
    is_published: n.isPublished
  }));

  await supabase.from('news_announcements').insert(rows);
}
