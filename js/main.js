import { Renderer } from './renderer.js';
import { Game } from './game.js';

const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const titleCanvas = document.getElementById('title-canvas');
const gameCanvas = document.getElementById('game-canvas');

const ui = {
  dialogueBox: document.getElementById('dialogue-box'),
  speaker: document.getElementById('speaker'),
  dialogueText: document.getElementById('dialogue-text'),
  toolLabel: document.getElementById('tool-label'),
  phaseLabel: document.getElementById('phase-label'),
  journalPanel: document.getElementById('journal-panel'),
  journalList: document.getElementById('journal-list'),
  journalClose: document.getElementById('journal-close'),
};

const titleRenderer = new Renderer(titleCanvas);
titleRenderer.drawTitle();

let game = null;

startBtn.addEventListener('click', () => {
  titleScreen.hidden = true;
  gameScreen.hidden = false;
  game = new Game(gameCanvas, ui);
  game.start();
});

ui.journalClose.addEventListener('click', () => {
  ui.journalPanel.hidden = true;
  if (game) game.input.setEnabled(true);
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyJ' && game && !ui.journalPanel.hidden) {
    ui.journalPanel.hidden = true;
    game.input.setEnabled(true);
  }
});
