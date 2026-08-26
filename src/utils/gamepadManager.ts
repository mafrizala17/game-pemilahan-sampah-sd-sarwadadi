/**
 * Gamepad / Console Controller Manager (Xbox, PlayStation DualShock/DualSense, Generic)
 * Supports HTML5 Gamepad API, D-Pad, Thumbsticks, Action Buttons & Vibration / Haptic Feedback
 */

export interface GamepadState {
  connected: boolean;
  id: string;
  type: 'xbox' | 'dualshock' | 'nintendo' | 'generic';
  axes: { x: number; y: number };
  buttons: {
    a: boolean; // Button 0 (Xbox A, PS Cross ✕, Switch B)
    b: boolean; // Button 1 (Xbox B, PS Circle ⭕, Switch A)
    x: boolean; // Button 2 (Xbox X, PS Square ⬜, Switch Y)
    y: boolean; // Button 3 (Xbox Y, PS Triangle 🔺, Switch X)
    lb: boolean; // Button 4 (L1)
    rb: boolean; // Button 5 (R1)
    lt: boolean; // Button 6 (L2)
    rt: boolean; // Button 7 (R2)
    back: boolean; // Button 8 (Select / Share)
    start: boolean; // Button 9 (Start / Options)
    dpadUp: boolean; // Button 12
    dpadDown: boolean; // Button 13
    dpadLeft: boolean; // Button 14
    dpadRight: boolean; // Button 15
  };
}

class GamepadManager {
  private connected: boolean = false;
  private gamepadName: string = '';
  private gamepadType: 'xbox' | 'dualshock' | 'nintendo' | 'generic' = 'generic';
  private previousButtonStates: { [key: number]: boolean } = {};
  private listeners: ((state: GamepadState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
        this.onGamepadConnected(e.gamepad);
      });

      window.addEventListener('gamepaddisconnected', () => {
        this.onGamepadDisconnected();
      });
    }
  }

  private detectType(id: string): 'xbox' | 'dualshock' | 'nintendo' | 'generic' {
    const lower = id.toLowerCase();
    if (lower.includes('xbox') || lower.includes('x-box') || lower.includes('microsoft')) {
      return 'xbox';
    }
    if (lower.includes('dualshock') || lower.includes('dualsense') || lower.includes('playstation') || lower.includes('sony') || lower.includes('054c')) {
      return 'dualshock';
    }
    if (lower.includes('nintendo') || lower.includes('switch') || lower.includes('joy-con') || lower.includes('pro controller')) {
      return 'nintendo';
    }
    return 'generic';
  }

  private onGamepadConnected(gamepad: Gamepad) {
    this.connected = true;
    this.gamepadName = gamepad.id;
    this.gamepadType = this.detectType(gamepad.id);
    console.log(`[Gamepad] Connected: ${gamepad.id} (${this.gamepadType})`);
    this.vibrate(100, 0.4, 0.4);
  }

  private onGamepadDisconnected() {
    this.connected = false;
    this.gamepadName = '';
    this.gamepadType = 'generic';
    console.log('[Gamepad] Disconnected');
  }

  public getActiveGamepad(): Gamepad | null {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        if (!this.connected) {
          this.onGamepadConnected(gp);
        }
        return gp;
      }
    }
    return null;
  }

  public poll(): GamepadState {
    const gp = this.getActiveGamepad();
    if (!gp) {
      return {
        connected: false,
        id: '',
        type: 'generic',
        axes: { x: 0, y: 0 },
        buttons: {
          a: false,
          b: false,
          x: false,
          y: false,
          lb: false,
          rb: false,
          lt: false,
          rt: false,
          back: false,
          start: false,
          dpadUp: false,
          dpadDown: false,
          dpadLeft: false,
          dpadRight: false
        }
      };
    }

    // Deadzone filter for analog stick
    const DEADZONE = 0.22;
    let axisX = gp.axes[0] || 0;
    let axisY = gp.axes[1] || 0;
    if (Math.abs(axisX) < DEADZONE) axisX = 0;
    if (Math.abs(axisY) < DEADZONE) axisY = 0;

    // Check DPAD Buttons
    const dpadUp = gp.buttons[12]?.pressed || false;
    const dpadDown = gp.buttons[13]?.pressed || false;
    const dpadLeft = gp.buttons[14]?.pressed || false;
    const dpadRight = gp.buttons[15]?.pressed || false;

    // Merge DPAD with Thumbstick
    let finalX = axisX;
    let finalY = axisY;
    if (dpadLeft) finalX = -1;
    if (dpadRight) finalX = 1;
    if (dpadUp) finalY = -1;
    if (dpadDown) finalY = 1;

    return {
      connected: true,
      id: gp.id,
      type: this.detectType(gp.id),
      axes: { x: finalX, y: finalY },
      buttons: {
        a: gp.buttons[0]?.pressed || false,
        b: gp.buttons[1]?.pressed || false,
        x: gp.buttons[2]?.pressed || false,
        y: gp.buttons[3]?.pressed || false,
        lb: gp.buttons[4]?.pressed || false,
        rb: gp.buttons[5]?.pressed || false,
        lt: gp.buttons[6]?.pressed || false,
        rt: gp.buttons[7]?.pressed || false,
        back: gp.buttons[8]?.pressed || false,
        start: gp.buttons[9]?.pressed || false,
        dpadUp,
        dpadDown,
        dpadLeft,
        dpadRight
      }
    };
  }

  // Check single button press (trigger once on down)
  public isButtonJustPressed(buttonIndex: number): boolean {
    const gp = this.getActiveGamepad();
    if (!gp) return false;
    const isPressed = gp.buttons[buttonIndex]?.pressed || false;
    const wasPressed = this.previousButtonStates[buttonIndex] || false;
    this.previousButtonStates[buttonIndex] = isPressed;
    return isPressed && !wasPressed;
  }

  // Haptic feedback / vibration support
  public vibrate(durationMs: number = 150, strongMagnitude: number = 0.5, weakMagnitude: number = 0.5) {
    try {
      const gp = this.getActiveGamepad();
      if (gp && 'vibrationActuator' in gp && (gp as any).vibrationActuator) {
        (gp as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude,
          strongMagnitude
        });
      }
    } catch {
      // Gamepad haptics may not be supported in all browsers
    }
  }

  public getControllerLabel(): string {
    const type = this.gamepadType;
    if (type === 'xbox') return 'Xbox Controller';
    if (type === 'dualshock') return 'PlayStation DualShock / DualSense';
    if (type === 'nintendo') return 'Nintendo Controller';
    return 'Gamepad Terhubung';
  }

  public getActionHint(action: 'action' | 'tps' | 'pause' | 'organik' | 'anorganik' | 'b3'): string {
    const type = this.gamepadType;
    if (type === 'dualshock') {
      switch (action) {
        case 'action': return '✕ Ambil';
        case 'tps': return '⬜ Buka TPS';
        case 'pause': return 'OPTIONS Jeda';
        case 'organik': return '✕ Organik';
        case 'anorganik': return '⭕ Anorganik';
        case 'b3': return '⬜ B3';
      }
    } else if (type === 'nintendo') {
      switch (action) {
        case 'action': return 'B Ambil';
        case 'tps': return 'Y Buka TPS';
        case 'pause': return '+ Jeda';
        case 'organik': return 'B Organik';
        case 'anorganik': return 'A Anorganik';
        case 'b3': return 'Y B3';
      }
    } else {
      // Xbox / Generic
      switch (action) {
        case 'action': return 'A Ambil';
        case 'tps': return 'X Buka TPS';
        case 'pause': return 'START Jeda';
        case 'organik': return 'A Organik';
        case 'anorganik': return 'B Anorganik';
        case 'b3': return 'X B3';
      }
    }
    return '';
  }
}

export const gamepadManager = new GamepadManager();
