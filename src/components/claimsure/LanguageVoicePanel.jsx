import { useState } from 'react';
import { Globe, Volume2, VolumeX } from 'lucide-react';

export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🌏' },
    { code: 'te', label: 'తెలుగు', flag: '🌏' },
    { code: 'bn', label: 'বাংলা', flag: '🌏' },
];

// Key UI string translations
export const T = {
    en: { shift_start: 'Start Shift', shift_stop: 'End Shift', payout: 'Payout Received', weather_alert: 'Severe weather detected in your area. Claim submitted automatically.' },
    hi: { shift_start: 'शिफ्ट शुरू करें', shift_stop: 'शिफ्ट समाप्त करें', payout: 'भुगतान प्राप्त हुआ', weather_alert: 'आपके क्षेत्र में गंभीर मौसम। दावा स्वचालित रूप से जमा हो गया।' },
    ta: { shift_start: 'ஷிப்ட் தொடங்கு', shift_stop: 'ஷிப்ட் முடிக்கவும்', payout: 'பணம் பெறப்பட்டது', weather_alert: 'உங்கள் பகுதியில் கடுமையான வானிலை. கோரிக்கை தானாக சமர்ப்பிக்கப்பட்டது.' },
    te: { shift_start: 'షిఫ్ట్ ప్రారంభించు', shift_stop: 'షిఫ్ట్ ముగించు', payout: 'చెల్లింపు వచ్చింది', weather_alert: 'మీ ప్రాంతంలో తీవ్రమైన వాతావరణం. క్లెయిమ్ స్వయంచాలకంగా సమర్పించబడింది.' },
    bn: { shift_start: 'শিফট শুরু করুন', shift_stop: 'শিফট শেষ করুন', payout: 'পেআউট পাওয়া গেছে', weather_alert: 'আপনার এলাকায় তীব্র আবহাওয়া। দাবি স্বয়ংক্রিয়ভাবে জমা দেওয়া হয়েছে।' },
};

export function speakAlert(text, lang = 'en') {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' };
    utter.lang = langMap[lang] || 'en-IN';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
}

export default function LanguageVoicePanel({ lang, onLangChange, voiceEnabled, onVoiceToggle }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Language & Voice</span>
                </div>
                <button
                    onClick={onVoiceToggle}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${voiceEnabled
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-secondary border-border text-muted-foreground'
                        }`}
                >
                    {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
                </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
                {LANGUAGES.map(l => (
                    <button
                        key={l.code}
                        onClick={() => onLangChange(l.code)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${lang === l.code
                            ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                            : 'border-border text-muted-foreground hover:border-primary/20'
                            }`}
                    >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
