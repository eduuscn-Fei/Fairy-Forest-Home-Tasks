// Pre-trigger voice loading for browsers that load them asynchronously
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
}

/**
 * Find the highest quality humanoid / natural-sounding English voice available in the current browser.
 */
function findBestHumanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
  
  if (englishVoices.length === 0) return null;

  // 1. High-priority: MS Natural / Edge Neural (These sound remarkably humanoid)
  const neuralVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes("natural") || 
    v.name.toLowerCase().includes("neural")
  );
  if (neuralVoice) return neuralVoice;

  // 2. High-priority: Siri / Apple Premium voices
  const siriVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes("siri") || 
    v.name.toLowerCase().includes("premium")
  );
  if (siriVoice) return siriVoice;

  // 3. Medium-priority: Google US/GB English high-quality
  const googleVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes("google") && 
    (v.lang.toLowerCase().startsWith("en-us") || v.lang.toLowerCase().startsWith("en-gb"))
  );
  if (googleVoice) return googleVoice;

  // 4. Custom Apple warm voices (Samantha / Daniel)
  const samanthaVoice = englishVoices.find(v => 
    v.name.toLowerCase().includes("samantha") || 
    v.name.toLowerCase().includes("daniel")
  );
  if (samanthaVoice) return samanthaVoice;

  // 5. General Google English voice
  const generalGoogleVoice = englishVoices.find(v => v.name.toLowerCase().includes("google"));
  if (generalGoogleVoice) return generalGoogleVoice;

  // 6. Prefer standard en-US or en-GB over others
  const dialectVoice = englishVoices.find(v => 
    v.lang.toLowerCase() === "en-us" || 
    v.lang.toLowerCase() === "en-gb"
  );
  if (dialectVoice) return dialectVoice;

  return englishVoices[0];
}

/**
 * Speak any text announcements out loud using native Web Speech Synthesis.
 */
export function speakText(text: string, enabled: boolean): void {
  if (!enabled || !window.speechSynthesis) return;

  try {
    // Cancel any current speaking to prevent build-up queue
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = findBestHumanVoice();

    if (bestVoice) {
      utterance.voice = bestVoice;
      
      const voiceName = bestVoice.name.toLowerCase();
      // Dynamically optimize rate and pitch for different voice profiles
      if (voiceName.includes("natural") || voiceName.includes("neural") || voiceName.includes("siri")) {
        // Natural & Neural voices already have perfect speed and natural inflection
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      } else if (voiceName.includes("google")) {
        // Google voices sound great when slightly relaxed and clear
        utterance.rate = 0.95;
        utterance.pitch = 1.02;
      } else {
        // Standard older synthesis engines benefit from lower speed and standard pitch to reduce tinny sound
        utterance.rate = 0.90;
        utterance.pitch = 1.05; // warm, slightly friendly tone
      }
    } else {
      // Fallback defaults
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
    }

    // Set voice volume comfortably
    utterance.volume = 0.95;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Speech Synthesis failed:", error);
  }
}

/**
 * Custom sound effects synthesizer using HTML5 Web Audio API to bypass asset dependency.
 * This guarantees audio feedback for points, level-up, and error clicks on physical devices.
 */
export function playSyntheticBeep(type: "coin" | "levelUp" | "click" | "success" | "laser"): void {
  if (!window.AudioContext && !(window as any).webkitAudioContext) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    
    if (type === "coin") {
      // Coin collect chime: double-sine rising tone
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);
    } else if (type === "levelUp") {
      // Level Up grand arpeggio chord
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C major triad
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
      });
    } else if (type === "click") {
      // Simple gentle UI tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === "success") {
      // Sparkline clean sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (error) {
    // Audio engine blocked by browser autoplay rules initially
  }
}
