"use client";

// This creates the instance once when the app starts
let popInstance = null;
let isAudioUnlocked = false;

if (typeof window !== 'undefined') {
  popInstance = new Audio('/pop.mp3');
  popInstance.crossOrigin = "anonymous";
  popInstance.preload = "auto";
  popInstance.volume = 0.4;

  // 🚀 One-time listener to unlock audio for mobile/modern browsers
  const unlockAudio = () => {
    if (popInstance && !isAudioUnlocked) {
      popInstance.play()
        .then(() => {
          popInstance.pause();
          popInstance.currentTime = 0;
          isAudioUnlocked = true;
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        })
        .catch(() => { /* Still blocked */ });
    }
  };

  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

/**
 * Plays the pop sound effect with zero latency.
 * Resets currentTime to 0 to allow rapid-fire playing.
 */
export const playPopSound = () => {
  if (!popInstance) return;

  try {
    // ⚡ Reset the time so it can play again immediately
    popInstance.currentTime = 0;
    
    const playPromise = popInstance.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Log error only if it's not the common 'user-did-not-interact' error
        if (error.name !== 'NotAllowedError') {
          console.warn("Audio playback failed:", error);
        }
      });
    }
  } catch (err) {
    console.error("Sound system error:", err);
  }
};