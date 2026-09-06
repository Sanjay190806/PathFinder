import { MicOff, Settings2 } from 'lucide-react';

interface MicrophoneHelpPanelProps {
  onUseTypingMode: () => void;
  onTryAgain: () => void;
}

export const MicrophoneHelpPanel: React.FC<MicrophoneHelpPanelProps> = ({
  onUseTypingMode,
  onTryAgain
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-4 text-xs select-none">
      <div className="flex items-center gap-2 text-accentOrange">
        <MicOff className="h-4 w-4" />
        <h4 className="font-bold uppercase tracking-wider">Voice Capture Diagnostics</h4>
      </div>

      <div className="flex flex-col gap-2.5 text-textSecondary leading-relaxed">
        <p className="font-semibold text-textPrimary">Common causes for speaking errors:</p>
        <ul className="list-disc pl-4 flex flex-col gap-1.5">
          <li><strong>Microphone Permission Blocked:</strong> Click the lock icon in your address bar and toggle microphone access to 'Allow'.</li>
          <li><strong>Unsupported Browser:</strong> Chrome, Edge, and Safari support SpeechRecognition. Brave users must enable Google Services in settings.</li>
          <li><strong>Brave Privacy Shields:</strong> Shields block speech tracking features by default. Toggle shields OFF for this domain to practice speaking.</li>
          <li><strong>Unselected Device:</strong> Ensure your recording device is plugged in and set as default in OS sound panel.</li>
        </ul>
      </div>

      {/* Settings Guide */}
      <div className="flex items-start gap-2.5 border-t border-white/5 pt-4 text-textMuted">
        <Settings2 className="h-4 w-4 shrink-0 mt-0.5 text-accentBlue" />
        <div>
          <span className="block font-bold text-textSecondary">Browser settings page:</span>
          <span className="block mt-0.5 font-mono select-all">chrome://settings/content/microphone</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={onUseTypingMode}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-textPrimary hover:bg-white/10 transition"
        >
          Use Typing Mode
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="rounded-xl bg-accentBlue px-4 py-2 font-bold text-white hover:bg-accentBlue/90 transition shadow-glow-blue/10"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
export default MicrophoneHelpPanel;
