/**
 * CRANE FEATURING PAIGE
 * Indigo floating voice orb with settings panel
 * Persona: Creative designer & product strategist - visionary, empathetic, design-forward
 * Chief Creative Officer for BERYL LABS
 * 
 * Cloned from CONNIE with same UI structure, different color scheme and persona
 */

class PAIGEVoiceOrb {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.conversationHistory = [];
    this.settings = {
      customInstructions: "",
      selectedModel: "gemma-4-e2b-uncensored",
      selectedVoice: "Magpie-Multilingual.EN-US.Aria",
      tone: "creative",
      pitch: 1.0,
    };
    this.settingsPanelOpen = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    this.init();
  }

  init() {
    this.createOrbUI();
    this.createSettingsPanel();
    this.wireEventListeners();
    this.loadSettings();
  }

  createOrbUI() {
    // Container
    const container = document.createElement("div");
    container.id = "paige-voice-orb-container";
    container.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 120px;
      z-index: 99999;
      font-family: 'Fira Code', monospace;
    `;

    // Indigo orb (draggable) — same size as CONNIE, different color
    const orb = document.createElement("div");
    orb.id = "paige-voice-orb";
    orb.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #818cf8, #4f46e5);
      box-shadow: 0 0 30px rgba(129, 140, 248, 0.6), inset -2px -2px 5px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.2);
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      transition: all 0.3s ease;
      border: 2px solid rgba(129, 140, 248, 0.8);
    `;

    // Inner glow
    const innerGlow = document.createElement("div");
    innerGlow.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 40%, #818cf8, rgba(129, 140, 248, 0.3));
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Microphone icon or listening indicator
    const micIcon = document.createElement("div");
    micIcon.id = "paige-mic-icon";
    micIcon.innerHTML = "🎨";
    micIcon.style.cssText = `
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    `;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
      @keyframes listening {
        0%, 100% { box-shadow: 0 0 30px rgba(129, 140, 248, 0.6); }
        50% { box-shadow: 0 0 50px rgba(129, 140, 248, 0.9); }
      }
      #paige-voice-orb.listening {
        animation: listening 1s infinite;
      }
    `;
    document.head.appendChild(style);

    innerGlow.appendChild(micIcon);
    orb.appendChild(innerGlow);
    container.appendChild(orb);
    document.body.appendChild(container);

    // Status label
    const label = document.createElement("div");
    label.id = "paige-status-label";
    label.textContent = "PAIGE";
    label.style.cssText = `
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      color: #4f46e5;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      letter-spacing: 0.5px;
    `;
    container.appendChild(label);

    // Make orb draggable
    this.makeDraggable(orb, container);
  }

  createSettingsPanel() {
    const panel = document.createElement("div");
    panel.id = "paige-settings-panel";
    panel.style.cssText = `
      display: none;
      position: fixed;
      bottom: 130px;
      right: 30px;
      width: 320px;
      background: #1f2937;
      border: 2px solid #4f46e5;
      border-radius: 12px;
      padding: 20px;
      z-index: 99998;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      font-family: 'Inter', sans-serif;
      color: #f3f4f6;
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: #9ca3af; margin-bottom: 8px;">PERSONA</label>
        <p style="margin: 0; font-size: 14px; font-weight: bold;">PAIGE</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Chief Creative Officer</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: #9ca3af; margin-bottom: 8px;">TONE</label>
        <select id="paige-tone-select" style="width: 100%; padding: 8px; background: #374151; border: 1px solid #4f46e5; color: #f3f4f6; border-radius: 6px;">
          <option value="creative">Creative & Visionary</option>
          <option value="collaborative">Collaborative & Empathetic</option>
          <option value="strategic">Strategic & Thoughtful</option>
          <option value="energetic">Energetic & Inspiring</option>
        </select>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; color: #9ca3af; margin-bottom: 8px;">CUSTOM INSTRUCTIONS</label>
        <textarea id="paige-custom-instructions" style="width: 100%; height: 80px; padding: 8px; background: #374151; border: 1px solid #4f46e5; color: #f3f4f6; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 11px; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; gap: 8px;">
        <button id="paige-save-settings" style="flex: 1; padding: 8px; background: #4f46e5; color: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">SAVE</button>
        <button id="paige-close-settings" style="flex: 1; padding: 8px; background: #374151; color: #f3f4f6; border: 1px solid #4f46e5; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">CLOSE</button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  wireEventListeners() {
    const orb = document.getElementById("paige-voice-orb");
    const container = document.getElementById("paige-voice-orb-container");

    // Click to toggle listening
    orb.addEventListener("click", () => this.toggleListening());
    orb.addEventListener("dblclick", () => this.toggleSettings());

    // Settings buttons
    document.getElementById("paige-save-settings").addEventListener("click", () => this.saveSettings());
    document.getElementById("paige-close-settings").addEventListener("click", () => this.toggleSettings());
  }

  toggleListening() {
    this.isListening = !this.isListening;
    const orb = document.getElementById("paige-voice-orb");
    const label = document.getElementById("paige-status-label");

    if (this.isListening) {
      orb.classList.add("listening");
      label.textContent = "LISTENING...";
      label.style.color = "#818cf8";
    } else {
      orb.classList.remove("listening");
      label.textContent = "PAIGE";
      label.style.color = "#4f46e5";
    }
  }

  toggleSettings() {
    this.settingsPanelOpen = !this.settingsPanelOpen;
    const panel = document.getElementById("paige-settings-panel");
    panel.style.display = this.settingsPanelOpen ? "block" : "none";
  }

  saveSettings() {
    const tone = document.getElementById("paige-tone-select").value;
    const instructions = document.getElementById("paige-custom-instructions").value;

    this.settings.tone = tone;
    this.settings.customInstructions = instructions;

    localStorage.setItem("paige_settings", JSON.stringify(this.settings));
    console.log("✓ PAIGE settings saved", this.settings);
  }

  loadSettings() {
    const saved = localStorage.getItem("paige_settings");
    if (saved) {
      this.settings = JSON.parse(saved);
      document.getElementById("paige-tone-select").value = this.settings.tone;
      document.getElementById("paige-custom-instructions").value = this.settings.customInstructions;
    }
  }

  makeDraggable(orb, container) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    orb.onmousedown = (e) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
        orb.style.cursor = "grab";
      };
      document.onmousemove = (e) => {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        container.style.bottom = container.offsetTop - pos2 + "px";
        container.style.right = container.offsetLeft - pos1 + "px";
        orb.style.cursor = "grabbing";
      };
    };
  }
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new PAIGEVoiceOrb());
} else {
  new PAIGEVoiceOrb();
}
