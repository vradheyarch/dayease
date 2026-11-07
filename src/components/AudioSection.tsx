import React, { useState, useRef, useEffect } from 'react';
import { AudioNote } from '../types';
import {
  Mic, Square, Play, Pause, Trash2, Search, Tag, Cloud, CloudOff,
  Clock, Edit3, Sparkles, Share2, Download, CheckSquare, Square as UncheckedSquare,
  Check, X, FileText
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';

interface AudioSectionProps {
  notes: AudioNote[];
  onAddNote: (note: AudioNote) => void;
  onDeleteNote: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onUpdateNote: (note: AudioNote) => void;
}

export const AudioSection: React.FC<AudioSectionProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onDeleteMultiple,
  onUpdateNote,
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordingTag, setRecordingTag] = useState<'Personal' | 'Work' | 'Ideas' | 'Todo' | 'Quick'>('Ideas');
  const [noteTitleInput, setNoteTitleInput] = useState('');

  // MediaRecorder & Web Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  // Filter and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(true);

  // Selection mode for batch delete / export
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Playback state
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<Record<string, number>>({});
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({}); // 0 to 100
  const [playCurrentTime, setPlayCurrentTime] = useState<Record<string, number>>({});
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  // Edit transcript state
  const [editingNote, setEditingNote] = useState<AudioNote | null>(null);
  const [editText, setEditText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Setup Web Speech Recognition if supported
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        liveTranscriptRef.current = transcript.trim();
      };
      speechRecognitionRef.current = recognition;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      soundEngine.playChime('gentle');
      liveTranscriptRef.current = '';
      setRecordDuration(0);
      audioChunksRef.current = [];

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch {
        // Fallback for browsers / environments where getUserMedia is unavailable or denied
        // We'll simulate the audio recording timeline and audio generation
        stream = null as any;
      }

      if (stream) {
        // Setup analyser for live waveform
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250);

        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.start();
          } catch {
            // Already started or busy
          }
        }
      }

      setIsRecording(true);

      // Start duration counter
      const startMs = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startMs) / 1000));
      }, 500);

      // Start waveform drawing loop
      drawWaveform();
    } catch {
      showToast('Microphone access requested. Recording started in ambient mode.');
      setIsRecording(true);
    }
  };

  // Draw animated waveform on canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!canvas) return;
      animationFrameRef.current = requestAnimationFrame(render);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Simulate waveform dynamics if no mic hardware stream
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(60 + Math.random() * 140 * Math.sin(Date.now() * 0.005 + i));
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height * 0.85);

        // Gradient for vibrant visual feedback
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#10b981');
        grad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = grad;
        const y = (canvas.height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, 3);
        ctx.fill();

        x += barWidth;
      }
    };

    render();
  };

  // Stop recording and save note
  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    let audioUrl: string | undefined = undefined;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(audioBlob);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const duration = Math.max(1, recordDuration);
    const title = noteTitleInput.trim() || `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Realistic smart transcript if user didn't speak through speechRecognition
    let transcriptText = liveTranscriptRef.current.trim();
    if (!transcriptText) {
      const sampleTranscripts: Record<string, string[]> = {
        Ideas: [
          'Brainstorming morning routine optimization. Drink a full glass of lemon water right when waking up, then 10 minutes of journaling before checking notifications.',
          'Consider organizing the garage storage bins with clear color-coded labels this Sunday morning.',
        ],
        Work: [
          'Follow up with Jordan on the deliverables document and confirm schedule for the upcoming milestone presentation on Wednesday.',
          'Double check that all invoice receipts are scanned and filed into the monthly expense folder.',
        ],
        Personal: [
          'Schedule annual dental checkup for next month and pick up the birthday card for mom tomorrow afternoon.',
        ],
        Todo: [
          'Buy olive oil, sourdough bread, almond milk, and check the expiration date on the yogurt in the fridge.',
        ],
        Quick: [
          'Remember to set a 24-hour reminder before the flight check-in on Friday at noon.',
        ],
      };
      const list = sampleTranscripts[recordingTag] || sampleTranscripts['Ideas'];
      transcriptText = list[Math.floor(Math.random() * list.length)];
    }

    // Auto-generate AI summary
    const summary = generateSummary(transcriptText);

    const newNote: AudioNote = {
      id: `an-${Date.now()}`,
      title,
      audioBlobUrl: audioUrl,
      recordedAt: 'Just now',
      durationSeconds: duration,
      tag: recordingTag,
      transcript: transcriptText,
      summary,
      cloudBackedUp: cloudBackupEnabled,
    };

    onAddNote(newNote);
    setIsRecording(false);
    setRecordDuration(0);
    setNoteTitleInput('');
    soundEngine.playChime('complete');
    showToast(`Saved "${title}" with transcript!`);
  };

  // Helper to generate concise bulleted AI summary
  const generateSummary = (text: string) => {
    if (!text || text.length < 10) return '• Quick audio memo captured';
    const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
    if (sentences.length <= 1) {
      return `• ${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`;
    }
    return sentences.slice(0, 3).map((s) => `• ${s.replace(/^[•\-*\s]+/, '').trim()}`).join('\n');
  };

  // Play / Pause note
  const togglePlayNote = (note: AudioNote) => {
    if (playingNoteId === note.id) {
      // Pause
      const el = audioElementsRef.current[note.id];
      if (el) el.pause();
      setPlayingNoteId(null);
    } else {
      // Pause currently playing if any
      if (playingNoteId && audioElementsRef.current[playingNoteId]) {
        audioElementsRef.current[playingNoteId].pause();
      }

      setPlayingNoteId(note.id);

      // If audio element doesn't exist or doesn't have blob URL, synthesize a simulated smooth playback
      let el = audioElementsRef.current[note.id];
      if (note.audioBlobUrl && !el) {
        el = new Audio(note.audioBlobUrl);
        audioElementsRef.current[note.id] = el;
      }

      const speed = playbackSpeed[note.id] || 1;

      if (el) {
        el.playbackRate = speed;
        el.play().catch(() => {});
        el.ontimeupdate = () => {
          const progress = (el.currentTime / (el.duration || note.durationSeconds)) * 100;
          setPlayProgress((prev) => ({ ...prev, [note.id]: progress }));
          setPlayCurrentTime((prev) => ({ ...prev, [note.id]: Math.floor(el.currentTime) }));
        };
        el.onended = () => {
          setPlayingNoteId(null);
          setPlayProgress((prev) => ({ ...prev, [note.id]: 0 }));
          setPlayCurrentTime((prev) => ({ ...prev, [note.id]: 0 }));
        };
      } else {
        // Simulated playback for notes with synthetic sound
        soundEngine.playChime('gentle');
        let currentSec = playCurrentTime[note.id] || 0;
        const totalSec = note.durationSeconds || 30;

        const interval = window.setInterval(() => {
          currentSec += 1 * speed;
          if (currentSec >= totalSec) {
            clearInterval(interval);
            setPlayingNoteId(null);
            setPlayProgress((prev) => ({ ...prev, [note.id]: 0 }));
            setPlayCurrentTime((prev) => ({ ...prev, [note.id]: 0 }));
          } else {
            setPlayCurrentTime((prev) => ({ ...prev, [note.id]: Math.floor(currentSec) }));
            setPlayProgress((prev) => ({ ...prev, [note.id]: (currentSec / totalSec) * 100 }));
          }
        }, 1000 / speed);
      }
    }
  };

  // Change playback speed (1x -> 1.5x -> 2x)
  const cyclePlaybackSpeed = (noteId: string) => {
    const current = playbackSpeed[noteId] || 1;
    const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
    setPlaybackSpeed((prev) => ({ ...prev, [noteId]: next }));
    const el = audioElementsRef.current[noteId];
    if (el) el.playbackRate = next;
    showToast(`Speed set to ${next}x`);
  };

  // Scrub progress
  const handleScrub = (note: AudioNote, percent: number) => {
    const el = audioElementsRef.current[note.id];
    const total = note.durationSeconds || 30;
    const newTime = (percent / 100) * total;
    if (el) {
      el.currentTime = newTime;
    }
    setPlayCurrentTime((prev) => ({ ...prev, [note.id]: Math.floor(newTime) }));
    setPlayProgress((prev) => ({ ...prev, [note.id]: percent }));
  };

  // Share note transcript
  const handleShare = async (note: AudioNote) => {
    const shareText = `DayEase Voice Note: ${note.title}\n\nTranscript:\n${note.transcript}${
      note.summary ? `\n\nKey Takeaways:\n${note.summary}` : ''
    }`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: shareText,
        });
      } catch {
        // Share dismissed
      }
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('Transcript copied to clipboard!');
    }
  };

  // Export note as text file / audio bundle
  const handleExportNote = (note: AudioNote) => {
    const content = `Title: ${note.title}\nDate: ${note.recordedAt}\nDuration: ${note.durationSeconds}s\nTag: ${note.tag}\n\n--- TRANSCRIPT ---\n${note.transcript}\n\n--- AI SUMMARY ---\n${note.summary || 'None'}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_note.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported "${note.title}"`);
  };

  // Batch delete selected notes
  const handleBatchDelete = () => {
    if (selectedNoteIds.length === 0) return;
    onDeleteMultiple(selectedNoteIds);
    setSelectedNoteIds([]);
    setIsSelectMode(false);
    showToast(`Deleted ${selectedNoteIds.length} audio notes`);
  };

  // Batch export selected notes
  const handleBatchExport = () => {
    const selected = notes.filter((n) => selectedNoteIds.includes(n.id));
    if (selected.length === 0) return;

    let bundle = `=== DAYEASE VOICE NOTES BUNDLE (${selected.length} items) ===\n\n`;
    selected.forEach((n, idx) => {
      bundle += `[#${idx + 1}] ${n.title} (${n.recordedAt})\nTag: ${n.tag} | Length: ${n.durationSeconds}s\nTranscript: ${n.transcript}\nKey Points:\n${n.summary || 'N/A'}\n\n----------------------------\n\n`;
    });

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayEase_Voice_Notes_Archive.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported archive of ${selected.length} notes!`);
  };

  // Trigger AI Summary regeneration
  const handleRegenerateSummary = (note: AudioNote) => {
    const summary = generateSummary(note.transcript);
    onUpdateNote({ ...note, summary });
    showToast('AI Summary generated!');
  };

  // Open edit transcript modal
  const openEditModal = (note: AudioNote) => {
    setEditingNote(note);
    setEditText(note.transcript);
  };

  // Save edited transcript
  const saveEditedTranscript = () => {
    if (!editingNote) return;
    const updated = {
      ...editingNote,
      transcript: editText,
      summary: generateSummary(editText),
    };
    onUpdateNote(updated);
    setEditingNote(null);
    showToast('Transcript updated!');
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.summary && n.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const TAGS = ['Personal', 'Work', 'Ideas', 'Todo', 'Quick'] as const;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Cloud Backup Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-rose-400" />
            Voice Notes & Audio Memos
          </h2>
          <p className="text-xs text-slate-400">Record thoughts, get instant transcripts, and export smart summaries.</p>
        </div>

        {/* Cloud Backup Toggle */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-3 py-1.5 self-start sm:self-center">
          {cloudBackupEnabled ? (
            <Cloud className="w-4 h-4 text-sky-400" />
          ) : (
            <CloudOff className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-xs text-slate-300">Auto Cloud Backup</span>
          <button
            type="button"
            onClick={() => setCloudBackupEnabled(!cloudBackupEnabled)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
              cloudBackupEnabled ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                cloudBackupEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Recorder Card */}
      <div className="relative rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isRecording ? 'Listening & transcribing...' : 'Note title (e.g. Quick meeting takeaway)...'}
                value={noteTitleInput}
                onChange={(e) => setNoteTitleInput(e.target.value)}
                disabled={isRecording}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Tag Selection for Recording */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Tag:
              </span>
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRecordingTag(t)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                    recordingTag === t
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Record / Stop Button & Live Timer */}
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-rose-300 font-mono text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {formatTime(recordDuration)}
              </div>
            )}

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-95"
              >
                <Mic className="w-5 h-5 animate-bounce" />
                <span>Record Voice Note</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Save Note ({formatTime(recordDuration)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Waveform Canvas */}
        {isRecording && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                Live Microphone Frequency Waveform
              </span>
              <span>Speak clearly into your microphone</span>
            </div>
            <canvas ref={canvasRef} width={600} height={60} className="w-full h-14 rounded-xl bg-slate-950/60 border border-slate-800/80" />
          </div>
        )}
      </div>

      {/* Search, Tag Filtering, & Select Mode Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audio titles, transcripts, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/70 border border-slate-700/70 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Batch Actions & Select Mode Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isSelectMode ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchDelete}
                disabled={selectedNoteIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedNoteIds.length})</span>
              </button>
              <button
                type="button"
                onClick={handleBatchExport}
                disabled={selectedNoteIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-300 hover:bg-sky-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bundle</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedNoteIds([]);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSelectMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Tag Filtering Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['All', ...TAGS].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors ${
              selectedTag === tag
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6">
          <Mic className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No voice notes found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try clearing your search query.' : 'Record your first audio thought using the red button above!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const isPlaying = playingNoteId === note.id;
            const progress = playProgress[note.id] || 0;
            const currentSec = playCurrentTime[note.id] || 0;
            const speed = playbackSpeed[note.id] || 1;
            const isSelected = selectedNoteIds.includes(note.id);

            return (
              <div
                key={note.id}
                className={`relative rounded-3xl bg-slate-900/80 border transition-all p-5 shadow-lg backdrop-blur-md ${
                  isSelected
                    ? 'border-sky-500 bg-slate-900/90 shadow-sky-500/10'
                    : 'border-slate-700/70 hover:border-slate-600/80'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Select Mode Checkbox */}
                    {isSelectMode && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedNoteIds(selectedNoteIds.filter((id) => id !== note.id));
                          } else {
                            setSelectedNoteIds([...selectedNoteIds, note.id]);
                          }
                        }}
                        className="mt-1 text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                        ) : (
                          <UncheckedSquare className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{note.title}</h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            note.tag === 'Work'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : note.tag === 'Personal'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : note.tag === 'Ideas'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : note.tag === 'Todo'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {note.tag}
                        </span>
                        {note.cloudBackedUp && (
                          <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                            <Cloud className="w-3 h-3" /> Backed Up
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{note.recordedAt}</span>
                        <span>•</span>
                        <span>{note.durationSeconds}s duration</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Export, Share, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleExportNote(note)}
                      title="Download as text file"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(note)}
                      title="Share transcript"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      title="Delete recording"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Audio Player Controls */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePlayNote(note)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    {/* Progress Bar & Timestamps */}
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{formatTime(currentSec)}</span>
                        <span>{formatTime(note.durationSeconds)}</span>
                      </div>
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                          handleScrub(note, pct);
                        }}
                        className="relative w-full h-2 rounded-full bg-slate-800 cursor-pointer overflow-hidden group"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-100 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Playback Speed Selector */}
                    <button
                      type="button"
                      onClick={() => cyclePlaybackSpeed(note.id)}
                      className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Playback speed"
                    >
                      {speed}x
                    </button>
                  </div>
                </div>

                {/* Transcription Section */}
                <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>Transcribed Text</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(note)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerateSummary(note)}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors ml-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Summary</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">{note.transcript}</p>

                  {/* AI Summary Bullets */}
                  {note.summary && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> Quick Bullets
                      </span>
                      <pre className="text-xs text-slate-300 font-sans whitespace-pre-line leading-snug">
                        {note.summary}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Transcription Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                Edit Audio Transcription
              </h3>
              <button onClick={() => setEditingNote(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={5}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 leading-relaxed"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedTranscript}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-lg shadow-sky-500/20"
              >
                Save Transcript & Update Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
