import { useState, useEffect } from 'react';
import { audioController } from '../services/audioController';

export function useAudioPlayer() {
  const [playerState, setPlayerState] = useState({
    isPlaying: audioController.isPlaying,
    currentResponseId: audioController.currentResponseId,
    stopLatency: audioController.stopLatency,
  });

  useEffect(() => {
    const unsubscribe = audioController.subscribe(setPlayerState);
    return unsubscribe;
  }, []);

  return {
    ...playerState,
    play: (base64, responseId, onEnded) => audioController.play(base64, responseId, onEnded),
    stop: () => audioController.stop(),
    interrupt: () => audioController.interrupt(),
  };
}
