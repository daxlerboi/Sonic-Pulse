/**
 * Audio analysis utilities for key and BPM detection.
 */

// Krumhansl-Schmuckler key profiles for Major and Minor keys
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Detects the musical key of an AudioBuffer using Chroma analysis.
 */
export async function detectKey(audioBuffer: AudioBuffer): Promise<{ key: string; scale: 'Major' | 'Minor' }> {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  
  // Mix to mono for analysis
  const channelData = audioBuffer.getChannelData(0);
  
  // We'll analyze a representative portion of the track (middle 30 seconds)
  const duration = audioBuffer.duration;
  const analysisDuration = Math.min(30, duration);
  const startSample = Math.floor((duration / 2 - analysisDuration / 2) * sampleRate);
  const endSample = startSample + Math.floor(analysisDuration * sampleRate);
  
  const chroma = new Float32Array(12).fill(0);
  
  // Simple FFT-based chroma calculation or Filter Bank
  // For simplicity and speed in a browser, we use a pitch-to-bin mapping
  // A more robust way is using Const-Q transform, but FFT is faster for this context.
  
  const fftSize = 4096;
  const offlineCtx = new OfflineAudioContext(1, endSample - startSample, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  
  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = fftSize;
  source.connect(analyser);
  analyser.connect(offlineCtx.destination);
  
  source.start(0, startSample / sampleRate);
  
  // "Play" the buffer through the offline context
  await offlineCtx.startRendering();
  
  // Extract frequency data and map to musical notes
  const freqData = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(freqData);
  
  for (let i = 0; i < freqData.length; i++) {
    const freq = (i * sampleRate) / fftSize;
    if (freq < 20 || freq > 5000) continue; // Human audible range for music notes
    
    // Convert frequency to MIDI note
    const midiNote = 12 * Math.log2(freq / 440) + 69;
    const noteIndex = Math.round(midiNote) % 12;
    
    // Add energy to the chroma bin
    const energy = Math.pow(10, freqData[i] / 20);
    chroma[noteIndex] += energy;
  }

  // Normalize chroma
  const maxVal = Math.max(...chroma);
  if (maxVal > 0) {
    for (let i = 0; i < 12; i++) chroma[i] /= maxVal;
  }

  // Correlate with profiles
  let bestScore = -Infinity;
  let bestKey = 0;
  let bestScale: 'Major' | 'Minor' = 'Major';

  for (let keyIdx = 0; keyIdx < 12; keyIdx++) {
    const majorScore = calculateCorrelation(rotateProfile(MAJOR_PROFILE, keyIdx), chroma);
    const minorScore = calculateCorrelation(rotateProfile(MINOR_PROFILE, keyIdx), chroma);

    if (majorScore > bestScore) {
      bestScore = majorScore;
      bestKey = keyIdx;
      bestScale = 'Major';
    }
    if (minorScore > bestScore) {
      bestScore = minorScore;
      bestKey = keyIdx;
      bestScale = 'Minor';
    }
  }

  return {
    key: NOTES[bestKey],
    scale: bestScale
  };
}

function rotateProfile(profile: number[], shift: number): number[] {
  const result = new Array(12);
  for (let i = 0; i < 12; i++) {
    result[(i + shift) % 12] = profile[i];
  }
  return result;
}

function calculateCorrelation(p1: number[], p2: Float32Array | number[]): number {
  let mean1 = 0, mean2 = 0;
  for (let i = 0; i < 12; i++) {
    mean1 += p1[i];
    mean2 += p2[i];
  }
  mean1 /= 12;
  mean2 /= 12;

  let num = 0, den1 = 0, den2 = 0;
  for (let i = 0; i < 12; i++) {
    const diff1 = p1[i] - mean1;
    const diff2 = p2[i] - mean2;
    num += diff1 * diff2;
    den1 += diff1 * diff1;
    den2 += diff2 * diff2;
  }
  return num / Math.sqrt(den1 * den2);
}
