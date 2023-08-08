interface Config {
  persistent: {
    damageBars: boolean;
    healthBars: boolean;
    bossHealthBars: boolean;
    bossDamageNums: boolean;
  };
}

export const configObject: Config = {
  persistent: {
    damageBars: true,
    healthBars: true,
    bossHealthBars: true,
    bossDamageNums: true,
  },
};
