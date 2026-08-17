import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Copy, Check, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';

const INK = '#0B2E22';
const PAPER = '#F7F1E1';
const DISC = '#D6472C';
const MARIGOLD = '#E7A93B';

export default function AiContentGenerator() {
  const [contentType, setContentType] = useState<'campaign' | 'press' | 'appeal' | 'social'>('campaign');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      let output = '';
      if (contentType === 'campaign') {
        output = `📢 CAMPAIGN APPEAL: ${prompt.toUpperCase()}\n\nDear Compassionate Supporters,\n\nWe urgently call upon your support for our latest initiative: "${prompt}". Thousands of vulnerable communities across Bangladesh rely on rapid intervention during critical times.\n\nKey Focus Areas:\n• Emergency Relief & Supplies Distribution\n• Medical & Mental Health Support\n• Clean Water & Hygiene Kits\n\nHow You Can Help:\n1. Share this campaign with your network\n2. Donate directly via ShebaBD verified portal\n3. Join as an active field volunteer\n\nTogether, we make a lasting impact. #ShebaBD #BangladeshRelief`;
      } else if (contentType === 'press') {
        output = `PRESS RELEASE — FOR IMMEDIATE RELEASE\n\nSUBJECT: ShebaBD Humanitarian Action: ${prompt}\n\nDHAKA, BANGLADESH — ShebaBD is announcing a target response regarding "${prompt}". Working alongside local administration and verified partner NGOs, operations are underway to provide relief and sustainable support.\n\n"Every second counts when emergency strikes," stated ShebaBD operations lead. "Our AI matching engine ensures resources reach the exact hotspots in record time."\n\nFor media inquiries: press@shebabd.org`;
      } else if (contentType === 'appeal') {
        output = `🚨 URGENT EMERGENCY APPEAL: ${prompt}\n\nTime is critical. Families affected by recent emergencies need immediate assistance.\n\nYour contribution provides:\n- 🍽️ Food packages for a family for 2 weeks\n- 💊 Essential medicines & blood donation coordination\n- ⛺ Emergency shelter units\n\nPlease open your heart today. Visit ShebaBD Emergency Portal.`;
      } else {
        output = `🌟 Make a difference today! ${prompt}\n\nJoin 50,000+ donors & volunteers united for Bangladesh. Check live updates and volunteer opportunities on ShebaBD.\n\n#ShebaBD #StandWithBangladesh #NGO #VolunteerBD`;
      }
      setGeneratedContent(output);
      setIsGenerating(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: INK }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(231,169,59,0.15)', color: MARIGOLD }}>
            <Sparkles size={14} className="shrink-0" />
            <span>AI Campaign &amp; Content Writer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: PAPER }}>
            Create High-Impact Humanitarian Content
          </h1>
          <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'rgba(247,241,225,0.7)' }}>
            Generate appeals, press releases, social media posts, and campaign descriptions tailored for NGOs and volunteers.
          </p>
        </motion.div>

        <div className="p-6 sm:p-8 rounded-2xl border" style={{ backgroundColor: '#0F3A2B', borderColor: 'rgba(247,241,225,0.12)' }}>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PAPER }}>
                Select Content Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'campaign', label: 'Campaign' },
                  { id: 'press', label: 'Press Release' },
                  { id: 'appeal', label: 'Urgent Appeal' },
                  { id: 'social', label: 'Social Post' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as any)}
                    className="py-2.5 px-3 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: contentType === type.id ? DISC : 'rgba(247,241,225,0.06)',
                      color: PAPER,
                      border: contentType === type.id ? 'none' : '1px solid rgba(247,241,225,0.1)',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PAPER }}>
                Campaign Topic or Key Details
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Sylhet Flood Relief 2026 emergency medical packages and warm food distribution..."
                className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'rgba(11,46,34,0.6)',
                  color: PAPER,
                  border: '1px solid rgba(247,241,225,0.2)',
                }}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              loading={isGenerating}
              className="w-full py-3.5 font-semibold"
              leftIcon={isGenerating ? undefined : Send}
              style={{ backgroundColor: DISC, color: PAPER }}
            >
              {isGenerating ? 'Generating Content...' : 'Generate with AI'}
            </Button>
          </div>
        </div>

        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-2xl border space-y-4"
            style={{ backgroundColor: '#0F3A2B', borderColor: 'rgba(247,241,225,0.12)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: MARIGOLD }}>
                <FileText size={16} className="shrink-0" />
                <span>Generated Result</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ backgroundColor: 'rgba(247,241,225,0.1)', color: PAPER }}
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <pre className="p-4 rounded-xl text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ backgroundColor: 'rgba(11,46,34,0.8)', color: PAPER }}>
              {generatedContent}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
