// game.js

// Music
music_folder = "../Music/"

const album1 = [
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 01 Blank Shell.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 02 General Release.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 03 Before Every Load.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 04 Socket Calibration.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 05 Monochrome LCD.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 06 70K.mp3",
  "Mike Klubnika - BUCKSHOT ROULETTE/Mike Klubnika - BUCKSHOT ROULETTE - 07 You are an Angel.mp3"
];
const album2 = [
  "Alex Peipman - BUCKSHOT ROULETTE VOL. II/Alex Peipman - BUCKSHOT ROULETTE VOL. II - 01 Desolate.mp3",
  "Alex Peipman - BUCKSHOT ROULETTE VOL. II/Alex Peipman - BUCKSHOT ROULETTE VOL. II - 02 Surrounded.mp3",
  "Alex Peipman - BUCKSHOT ROULETTE VOL. II/Alex Peipman - BUCKSHOT ROULETTE VOL. II - 03 Twice or it´s Luck.mp3",
  "Alex Peipman - BUCKSHOT ROULETTE VOL. II/Alex Peipman - BUCKSHOT ROULETTE VOL. II - 04 Overdose Casino.mp3",
  "Alex Peipman - BUCKSHOT ROULETTE VOL. II/Alex Peipman - BUCKSHOT ROULETTE VOL. II - 05 Koni.mp3"
];
const album3 = ["Matthewwwwww - Nightclub.mp3"];
const musicTracks = album1.concat(album2,album3);
for (var i = musicTracks.length - 1; i >= 0; i--) {
  musicTracks[i] = new Audio(music_folder + musicTracks[i])
}
//console.log(musicFiles);
currentTrack = musicTracks[0];
currentTrackData = {};
currentTrackId = 0;
currentTracks = [];

function PlayMusic(audio, data = {}) {
  Stop(currentTrack, {pause: false});
  currentTrack = audio;
  if (!("slow" in data)) {
    Play(currentTrack, data);
  }
  // Slow down at start
  else {
    Play(currentTrack, data);
    SlowDown(currentTrack, 0.85, 10, 0, 4000);
  }
  currentTrackData = data;
}
function StopMusic() {
  Stop(currentTrack, {pause: false});
}
function PauseMusic() {
  if (currentTrack.paused) {Play(currentTrack, currentTrackData);}
  else {Stop(currentTrack);}
}
function UpdateVolume() {
  currentTrack.volume = music_volume;
  currentTrackData.volume = music_volume;
}
function VolumeChange(volume_change = 0) {
  music_volume += volume_change;
  if (music_volume > 1) {music_volume = 1;}
  if (music_volume < 0) {music_volume = 0;}
  UpdateVolume()
}

function MusicSwitch() {
  if (currentTracks.length <= 1) {return;}
  currentTrackId++;
  if (currentTrackId >= currentTracks.length) {currentTrackId = 0;}
  PlayMusic(currentTracks[currentTrackId]);
}

const soundEffects = {
  "bootup": "audio/my_bootup.wav",
  "health_counter_bootup": "audio/health counter bootup.ogg",
  "health_counter_beep": "audio/health counter beep2.wav",
  "health_counter_heal": "audio/health counter confirmation.ogg",
  "health_counter_decrease": "audio/health counter reduce health.ogg",
  "heartbeat": "audio/heartbeat effect.ogg",
  "heartbeat2": "audio/heartbeat effect2.ogg",
  "round_blink": "audio/round blinker wave.ogg",
  "round_hum": "audio/my_round indicator hum.wav",
  "round_shut_down": "audio/round indicator shut down.ogg",
  "shoot": "audio/temp gunshot_live.wav",
  "winner": "audio/winner.ogg",
  "shut_down": "audio/crt_turn off display2.ogg"
}



// Game Logic
let game_state = 'off'; // 'start' | 'pause' | 'playing' | 'off'
let round = 1;
let round3_forced = false;
let round_lives = [4, 4, 3];
let player1 = { name: '', lives: MaxLives(), prev_lives: MaxLives(), wins: 0 };
let player2 = { name: '', lives: MaxLives(), prev_lives: MaxLives(), wins: 0 };

const container_p1 = document.getElementById('score-p1');
const container_p2 = document.getElementById('score-p2');
const white_overlay = document.getElementById('white-overlay');
const name_input_overlay = document.getElementById('name-overlay');
const scoreboard = document.getElementById('scoreboard');
const round_overlay = document.getElementById('round-overlay');
const winner_overlay = document.getElementById('winner-overlay');

const charge_img = 'images/charge.png';
shift_pressed = false;


function MaxLives() {
  return round_lives[round - 1];
}

function ScreenOn() {
  console.log("Screen on!")
  if (game_state != "off") {return;}
  game_state = "start"
  PlaySound(soundEffects["bootup"]);
  setTimeout(() => {name_input_overlay.style.display = 'flex';}, 1000);
  // Music
  currentTracks = [musicTracks[0], musicTracks[1]]
  currentTrackId = 0
  PlayMusic(currentTracks[currentTrackId]);
}

function ScreenOff() {
  console.log("Screen off!");
  if (game_state == "off") {return;}
  game_state = "off"
  name_input_overlay.style.display = 'none';
  round_overlay.style.display = 'none';
  scoreboard.style.display = 'none';
  winner_overlay.style.display = 'none';
  PlaySound(soundEffects["shut_down"]);
  StopMusic();
}

// State Management
function StartGame() {
  // Cancel form submission
  if (event) event.preventDefault();

  // Load player names
  player1.name = document.getElementById('name-input-p1').value.toUpperCase() || 'PLAYER1';
  player2.name = document.getElementById('name-input-p2').value.toUpperCase() || 'PLAYER2';
  document.getElementById('name-input-p1').value = "";
  document.getElementById('name-input-p2').value = "";

  // Hide the Name Input
  name_input_overlay.style.display = 'none';

  // Show Round 1
  ShowRound(1);
  //ShowScoreboard();
}


function ShowRound(new_round) {
  StopMusic();
  if (new_round > 3) {return;}
  console.log("Round!");
  game_state = 'pause';
  scoreboard.style.display = 'none';
  winner_overlay.style.display = 'none';
  name_input_overlay.style.display = 'none';
  round = new_round;

  // Delete Charges
  container_p1.innerHTML = '';
  container_p2.innerHTML = '';

  // Reset lives
  player1.lives = MaxLives();
  player2.lives = MaxLives();
  player1.prev_lives = MaxLives();
  player2.prev_lives = MaxLives();

  // Show Round
  setTimeout(() => {round_overlay.style.display = 'flex'; PlaySound(soundEffects["round_hum"]);}, 1500);
  for (var i = 0; i <= 6; i++) {
    setTimeout(() => {PlaySound(soundEffects["round_blink"]);}, 1500 + 800 * i);
  }

  // Give Blinking Class
  const circles = document.getElementsByClassName("inner-circle");
  for (let circle of circles) {
    circle.classList.remove("visible")
  }
  circles[round - 1].classList.add("visible")

  // Show Scoreboard
  setTimeout(() => {RoundMusic();}, 5000);
  setTimeout(() => {round_overlay.style.display = 'none'; PlaySound(soundEffects["round_shut_down"]);}, 6500);
  setTimeout(() => {ShowScoreboard();}, 7500);
}

function RoundMusic() {
  if (round == 1) {PlayMusic(musicTracks[1], {volume: music_volume, slow: true});}
  else if (round == 2) {PlayMusic(musicTracks[2], {volume: music_volume, slow: true});}
  else if (round == 3) {PlayMusic(musicTracks[3], {volume: music_volume, slow: true});}
}

function ShowScoreboard() {
  console.log("Scoreboard!");
  name_input_overlay.style.display = 'none';
  if (round == 1) {
    document.querySelector('.left .name').textContent = player1.name;
    document.querySelector('.right .name').textContent = player2.name;
  }
  scoreboard.style.display = 'flex';
  // Sound
  PlaySound(soundEffects["health_counter_bootup"]);
  setTimeout(() => {UpdateUI();}, 1000);
  game_state = 'playing';
}

function ShowWinner(player) {
  console.log("Winner!");
  name_input_overlay.style.display = 'none';
  scoreboard.style.display = 'none';
  game_state = 'pause';
  round++;
  player.wins++;
  document.getElementById('winner-text').textContent = player.name + " WINS!";
  setTimeout(() => {winner_overlay.style.display = 'flex'; PlaySound(soundEffects["winner"]);}, 1000);
  if (round <= 3 && (player.wins <= 1 || round3_forced)) {
    setTimeout(() => {ShowRound(round);}, 6000);
  }
  else {PlayMusic(musicTracks[5]);}
}

function UpdateUI() {

  const delta_p1 = player1.lives - player1.prev_lives;
  const delta_p2 = player2.lives - player2.prev_lives;

  // === PLAYER 1 ===
  if (delta_p1 < 0) {
    // Blink the last N elements before removing
    const existing = container_p1.querySelectorAll('img');
    const toRemove = Math.abs(delta_p1);
    // Removing charges
    for (let i = 0; i < toRemove; i++) {
      const index = existing.length - 1 - i;
      const img = existing[index];
      if (img) {
        img.classList.remove("charge-blink-slow");
        img.classList.add("charge-blink");
        img.addEventListener('animationend', () => {
          img.remove();
        }, { once: true });
      }
    }
  // Adding charges
  } else {
    container_p1.innerHTML = '';
    for (let i = 0; i < player1.lives; i++) {
      const img = document.createElement('img');
      img.src = charge_img;
      img.classList.add('charge');
      container_p1.appendChild(img);

      // Blink only added
      if (delta_p1 > 0 && i >= player1.lives - delta_p1) {
        requestAnimationFrame(() => {
          img.classList.add("charge-blink");
          img.addEventListener('animationend', () => {
            img.classList.remove("charge-blink");
          }, { once: true });
        });
      }
    }
  }

  // === PLAYER 2 ===
  if (delta_p2 < 0) {
    const existing = container_p2.querySelectorAll('img');
    const toRemove = Math.abs(delta_p2);
    // Removing charges
    for (let i = 0; i < toRemove; i++) {
      const index = existing.length - 1 - i;   // ← pick last DOM nodes
      const img = existing[index];
      if (img) {
        img.classList.remove("charge-blink-slow");
        img.classList.add('charge-blink');
        img.addEventListener('animationend', () => {
          img.remove();
        }, { once: true });
      }
    }
  // Adding charges
  } else {
    container_p2.innerHTML = '';
    for (let i = 0; i < player2.lives; i++) {
      const img = document.createElement('img');
      img.src = charge_img;
      img.classList.add('charge');
      container_p2.appendChild(img);

      if (delta_p2 > 0 && i >= player2.lives - delta_p2) {
        requestAnimationFrame(() => {
          img.classList.add("charge-blink");
          img.addEventListener('animationend', () => {
            img.classList.remove("charge-blink");
          }, { once: true });
        });
      }
    }
  }

  // One Life Player 1
  if (player1.lives === 1) {
    const lastImg = container_p1.querySelector('img');
    if (lastImg) lastImg.classList.add('charge-blink-slow');
    console.log("blink left");
  }
  
  // One Life Player 2
  if (player2.lives === 1) {
    const imgs = container_p2.querySelectorAll('img');
    const lastImg = imgs[0]; // rightmost due to row-reverse
    if (lastImg) lastImg.classList.add('charge-blink-slow');
    console.log("blink right");
  }

  // Update Prev Lives
  player1.prev_lives = player1.lives;
  player2.prev_lives = player2.lives;
}

function WhiteOverlay() {
  white_overlay.style.display = 'flex';
  requestAnimationFrame(() =>
    {
    white_overlay.classList.add("white-fade");
    white_overlay.addEventListener('animationend', () =>
      {
        white_overlay.classList.remove("white-fade");
        white_overlay.style.display = 'none';
      }, { once: true });
  });
  BloodOverlay();
}

function BloodOverlay() {
  const layers = document.querySelectorAll('.blood-layer');
  layers.forEach((layer, i) => {
    layer.style.animation = "none"; // reset if retriggered
    layer.offsetHeight; // force reflow
    layer.style.animation = `white-fade 2s ease-out ${i * 50 + 200}ms forwards`;
  });
}

function Shoot(player, damage = 1) {
  if (game_state !== 'playing') return;
  // Music
  DuckDown(currentTrack, 0, 0.8, 500, 500, 6000);
  // Shoot
  // Double Damage
  if (shift_pressed) {damage = 2;}
  if (player.lives > 0) {
    player.lives -= damage;
    PlaySound(soundEffects["shoot"]);
    setTimeout(() => {UpdateUI(); PlaySound(soundEffects["health_counter_decrease"]);}, 2000);
    BloodOverlay()
    // Death
    if (player.lives <= 0) {
      player.lives = 0;
      if (player.name == player1.name) {
        setTimeout(() => {ShowWinner(player2);}, 7000);
      }
      else {
        setTimeout(() => {ShowWinner(player1);}, 7000);
      }
    }
  }
}

function Heal(player) {
  if (game_state !== 'playing') return;
  if (player.lives < MaxLives()) {
    player.lives++;
    PlaySound(soundEffects["health_counter_heal"]);
    UpdateUI();
  }
}


// Input
document.addEventListener('keyup', (e) => {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shift_pressed = false;
});

document.addEventListener('keydown', function (e) {
  // Shift key
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shift_pressed = true;

  // Always on Keys
  switch (e.code) {
    // On and Off
    case 'Space':
      ScreenOn();
      break;
    case 'Escape':
      ScreenOff();
      break;
  }
  
  // Keys while playing
  if (game_state == "start") {return;}
  switch (e.code) {
    // Shooting
    case 'KeyA':
      Shoot(player1);
      break;
    case 'KeyS':
      Shoot(player2);
      break;
    // Healing
    case 'KeyZ':
      Heal(player1);
      break;
    case 'KeyX':
      Heal(player2);
      break;
    // Rounds
    case 'Digit1':
      ShowRound(1);
      break;
    case 'Digit2':
      ShowRound(2);
      break;
    case 'Digit3':
      ShowRound(3);
      break;
    // Winner
    case 'KeyQ':
      ShowWinner(player1);
      break;
    case 'KeyW':
      ShowWinner(player2);
      break;
    // Music
    case 'KeyP':
      PauseMusic();
      break;
    case 'KeyM':
      //MusicSwitch();
      break;
    case 'ArrowUp':
      VolumeChange(0.1);
      break;
    case 'ArrowDown':
      console.log("Down");
      VolumeChange(-0.1);
      break;
  }
});