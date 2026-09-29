'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  AlertCircle
} from 'lucide-react';

export default function ContactSection() {
  const locale = useLocale();
  const isSi = locale === 'si';
  const t = useTranslations('Footer');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessKey, setBusinessKey] = useState('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const departmentOptions = [
    { key: 'general', titleEn: 'General Society Inquiries', titleSi: 'පොදු සමිති විමසීම්' },
    { key: 'rural-bank', titleEn: 'Rural Banking Department', titleSi: 'ග්‍රාමීය බැංකු අංශය' },
    { key: 'consumer', titleEn: 'Consumer Goods Section', titleSi: 'පාරිභෝගික අංශය' },
    { key: 'fuel-station', titleEn: 'Co-op Fuel Station', titleSi: 'ඉන්ධන පිරවුම්හල' },
    { key: 'commercial-agency', titleEn: 'Commercial Product Agencies', titleSi: 'වාණිජ නියෝජිතායතන' },
    { key: 'funeral', titleEn: 'Funeral Care Services', titleSi: 'අවමංගල්‍ය සේවා අංශය' },
    { key: 'other', titleEn: 'Other', titleSi: 'වෙනත්' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSubmittedSuccess(false);

    try {
      const selectedDept = departmentOptions.find(d => d.key === businessKey);
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_key: businessKey,
          business_name: isSi ? selectedDept?.titleSi : selectedDept?.titleEn,
          user_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          subject: `${isSi ? 'නිල වෙබ් විමසීම' : 'Official Web Inquiry'} - ${isSi ? selectedDept?.titleSi : selectedDept?.titleEn}`,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
        setFullName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMessage(data.error || (isSi ? 'විමසීම යොමු කිරීම අසාර්ථක විය.' : 'Failed to submit inquiry.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isSi ? 'සම්බන්ධතා දෝෂයකි.' : 'Network connection error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-[#f8fafc] py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 font-sans scroll-mt-20 border-t border-neutral-200/80"
    >
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Section Header */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#003399] rounded-full shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wider text-[#003399] uppercase">
              {isSi ? 'අප හා සම්බන්ධ වන්න' : 'Contact Us'}
            </span>
          </div>
          <h2 className="font-condensed text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
            {isSi ? 'සම්බන්ධතා සහ නිල විමසීම්' : 'Get in Touch & Official Inquiries'}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            {isSi
              ? 'අපගේ ප්‍රධාන කාර්යාලය හා සම්බන්ධ වන්න, ශාඛාවන් අමතන්න හෝ පහත පෝරමය මඟින් ඔබගේ නිල විමසීම කෙලින්ම යොමු කරන්න.'
              : 'Reach out to our headquarters management or submit your inquiries, requests, and feedback directly.'}
          </p>
        </div>

        {/* 2-Column Layout: Contact Details & Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Official Contact Information */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#003399] flex items-center justify-center border border-blue-100 shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-condensed text-base font-bold text-neutral-900">
                  {isSi ? 'ප්‍රධාන ලේකම් කාර්යාලය' : 'Headquarters & Secretariat'}
                </h3>
                <p className="text-xs text-neutral-500">Panduwasnuwara New MPCS Ltd</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{t('addressSi')}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{t('addressEn')}</p>
                </div>
              </div>

              {/* Phone numbers */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('hotlineLabel')}</p>
                  <div className="flex items-center gap-3 mt-0.5 font-mono font-bold text-neutral-900">
                    <a href="tel:0372291011" className="hover:text-[#003399] transition-colors">037 229 1011</a>
                    <span className="text-neutral-300">|</span>
                    <a href="tel:0764247716" className="hover:text-[#003399] transition-colors">076 424 7716</a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('emailLabel')}</p>
                  <a href="mailto:panduwasnuwara@mpcs.lk" className="font-medium text-neutral-900 hover:text-[#003399] transition-colors block mt-0.5">
                    panduwasnuwara@mpcs.lk
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3 pt-3 border-t border-neutral-100">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-neutral-900">{t('hoursWeekday')}</p>
                  <p className="text-neutral-500 text-xs">{t('hoursSaturday')}</p>
                  <p className="text-neutral-400 text-[11px]">{isSi ? 'ඉරිදා සහ වෙළඳ නිවාඩු දිනවල වසා ඇත' : 'Closed on Sundays & Public Holidays'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Submission Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="font-condensed text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                {isSi ? 'විමසීම් පෝරමය' : 'Send an Inquiry or Message'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {isSi
                  ? 'ඔබගේ පණිවිඩය අදාළ අංශයේ නිල කළමනාකාරීත්වය වෙත කෙලින්ම යොමු කෙරේ.'
                  : 'Messages are automatically categorized and routed to our administrative inbox.'}
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-condensed text-lg font-bold text-emerald-950">
                  {isSi ? 'ඔබගේ විමසීම සාර්ථකව යොමු විය!' : 'Inquiry Submitted Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  {isSi
                    ? 'ඔබගේ විමසීම අපගේ පරිපාලන අංශය වෙත ලැබී ඇත. කඩිනමින් අපගේ නියෝජිතයෙකු ඔබ හා සම්බන්ධ වනු ඇත.'
                    : 'Your message has been routed to the relevant management queue. Our representative will contact you shortly.'}
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isSi ? 'තවත් පණිවිඩයක් යවන්න' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 block">
                      {isSi ? 'සම්පූර්ණ නම' : 'Full Name'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={isSi ? 'ඔබගේ නම ඇතුළත් කරන්න' : 'e.g. Sunil Perera'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 block">
                      {isSi ? 'දුරකථන / WhatsApp අංකය' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={isSi ? '07XXXXXXXX' : '07XXXXXXXX'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 block">
                      {isSi ? 'ඊමේල් ලිපිනය (විකල්ප)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white font-mono transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 block">
                      {isSi ? 'අදාළ ව්‍යාපාර අංශය' : 'Department / Subject'} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={businessKey}
                      onChange={e => setBusinessKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
                    >
                      {departmentOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {isSi ? opt.titleSi : opt.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'විමසීම හෝ පණිවිඩය' : 'Message / Inquiry Details'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={isSi ? 'ඔබගේ විමසීම හෝ පණිවිඩය මෙහි ලියන්න...' : 'Write the details of your inquiry or question here...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? (isSi ? 'යොමු වෙමින්...' : 'Submitting...')
                      : (isSi ? 'විමසීම යොමු කරන්න' : 'Submit Official Inquiry')}
                  </span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
