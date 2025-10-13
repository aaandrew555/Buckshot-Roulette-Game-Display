// Audio Script

// Initialise variables
default_fade_in = 2000
default_fade_out = 2000

sound_volume = 1
ambience_volume = 1
music_volume = 0.7

const MIN_PLAYBACK_RATE = 0.08;

// Default Audio
function AudioData(data) {
  if (!("volume" in data)) {data.volume = 1;}
  // Actually called playbackRate
  if (!("speed" in data)) {data.speed = 1;}
  if (!("fade_in" in data)) {data.fade_in = default_fade_in;}
  if (!("fade_out" in data)) {data.fade_out = default_fade_out;}
  if (!("reset" in data)) {data.reset = false;}
  if (!("pause" in data)) {data.pause = true;}
  return data;
}

// Fade Function
function Fade(audio, target_volume, duration, pause = true) {
  const step = 0.01;
  const interval = duration / (1 / step);
  const fade = setInterval(() => {
    if (Math.abs(audio.volume - target_volume) < step) {
      audio.volume = target_volume;
      if (target_volume === 0 && pause) audio.pause();
      clearInterval(fade);
    } else {
      audio.volume += (audio.volume < target_volume ? step : -step);
    }
  }, interval);
}

// Speed Function
function ChangeSpeed(audio, target_speed, duration, pause = true) {
  const step = 0.01;
  const steps = Math.max(1, Math.round(Math.abs(target_speed - audio.playbackRate) / step));
  const interval = duration / steps;

  const fade = setInterval(() => {
    let current = audio.playbackRate;
    let diff = target_speed - current;

    // Clamp target to supported range
    if (target_speed < MIN_PLAYBACK_RATE && target_speed !== 0) {
      target_speed = MIN_PLAYBACK_RATE;
    }

    if (Math.abs(diff) < step) {
      audio.playbackRate = target_speed;
      if (target_speed === 0 && pause) audio.pause();
      clearInterval(fade);
      return;
    }

    const next = current + Math.sign(diff) * step;

    if (!Number.isFinite(next) || next < MIN_PLAYBACK_RATE) {
      clearInterval(fade);
      return;
    }

    audio.playbackRate = next;
  }, interval);
}

// Function to play music/ambience
function Play(audio, data = {}) {
  if (!("volume" in data)) {data.volume = music_volume;}
  AudioData(data);
  if (audio == null) {
    console.log("THIS AUDIO DOES NOT EXIST");
    return;
  }
  audio.loop = true;
  if (audio.paused) {
    // Reset to start
    if (data.reset) {
      audio.currentTime = 0;
    }
    audio.play();
    audio.volume = 0;
    Fade(audio, data.volume, data.fade_in, data.pause);
  }
}

// Function to stop music/ambience
function Stop(audio, data = {}) {
  AudioData(data);
  if (audio.paused) {
    return;
  }
  Fade(audio, 0, data.fade_out);
}

function SlowDown(audio, target_speed = 0, transition_down = 1000, duration = 1000, transition_up = 1000) {
  if (audio.paused) {
    return;
  }
  ChangeSpeed(audio, target_speed, transition_down, false);
  setTimeout(() => {ChangeSpeed(audio, 1, transition_up, false);}, transition_down + duration + 10);
}

function FadeDown(audio, target_volume = 0, transition_down = 1000, duration = 1000, transition_up = 1000) {
  if (audio.paused) {
    return;
  }
  old_volume = audio.volume;
  Fade(audio, target_volume, transition_down, false);
  setTimeout(() => {Fade(audio, old_volume, transition_up, false);}, transition_down + duration + 10);
}

function DuckDown(audio, target_volume = 0, target_speed = 0, transition_down = 1000, duration = 1000, transition_up = 1000) {
  if (audio.paused) {
    return;
  }
  FadeDown(audio, target_volume, transition_down, duration, transition_up);
  SlowDown(audio, target_speed, transition_down, duration, transition_up);
}

function Mute(audio, data = {}) {
  if (!("fade_out" in data)) {data.fade_out = 500;}
  data = AudioData(data);
  if (audio.volume == 0) {
    return;
  }
  Fade(audio, 0, data.fade_out, false);
}

function Unmute(audio, data = {}) {
  if (!("fade_in" in data)) {data.fade_in = 500;}
  data = AudioData(data);
  if (audio.volume > 0) {
    return;
  }
  Fade(audio, data.volume, data.fade_in, false);
}

// Function to play a sound effect
function PlaySound(sound_file, data = {}) {
  if (!("volume" in data)) {data.volume = sound_volume;}
  AudioData(data);
  const sound = new Audio(sound_file);
  sound.volume = data.volume;
  sound.playbackRate = data.speed;
  sound.play();
  //console.log(sound.duration);
}