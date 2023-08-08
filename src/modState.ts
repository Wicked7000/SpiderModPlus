interface DamageNumber {
  text: string;
  opacity: number;
  position: Vector;
  velocity: Vector;
  ticks: number;
  xSpeed: number;
  xDirection: number;
}

export interface TrackingDescriptor {
  entityEffects: {
    background?: EntityEffect;
    foreground?: EntityEffect;
  };
  previousHealthAmount: number;
  tracking: EntityPtr;
}

interface GlobalState {
  game: Game;

  healthBar?: Sprite;
  healthBarRed?: Sprite;
  healthBars: Record<PtrHash, TrackingDescriptor>;
  textItems: Array<DamageNumber | undefined>;
  lastTextItemIndex: number;
  font: Font;

  hasSpidermodItem: boolean;

  // Time in seconds between the last two render frames.
  deltaTimeSeconds: number;
  // Epoch of the time of post render.
  lastFrameTime: number;
}

export const gameIsAvailable = (game: Game | undefined): game is Game =>
  game !== undefined;

export const initState = (): GlobalState => ({
  hasSpidermodItem: false,
  healthBars: {},

  textItems: [],
  lastTextItemIndex: 0,
  font: Font(),

  lastFrameTime: Isaac.GetTime(),
  deltaTimeSeconds: 0,
  game: Game(),
});

export const resetState = (): void => {
  state.textItems = [];
  state.lastTextItemIndex = 0;
  state.hasSpidermodItem = false;
  state.lastFrameTime = Isaac.GetTime();
  state.deltaTimeSeconds = 0;
  state.game = Game();
};

export const state = initState();
