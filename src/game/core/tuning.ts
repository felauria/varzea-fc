/**
 * Valores de balanceamento da partida, centralizados para ajuste fino.
 * Unidades: pixels de mundo e segundos.
 */
export const TUNING = {
  player: {
    radius: 5,
    walkSpeed: 74,
    sprintSpeed: 112,
    goalkeeperSpeed: 86,
    goalkeeperDiveSpeed: 135,
    dribbleSpeedFactor: 0.9,
    acceleration: 720,
    /** Quanto o jogador pode sair das linhas laterais (pixels). */
    sidelineMargin: 6,
  },
  ball: {
    radius: 2,
    /** Desaceleração exponencial no chão (1/s): distância total = v0 / k. */
    groundDamping: 1.25,
    airDamping: 0,
    stopSpeed: 4,
    wallRestitution: 0.55,
    gravity: 420,
    bounceRestitution: 0.42,
    bounceGroundFriction: 0.7,
    /** Acima desta altura a bola não pode ser dominada (passe longo "por cima"). */
    controlHeight: 7,
    dribbleOffset: 7,
    dribbleFollow: 18,
  },
  possession: {
    pickupRadius: 8,
    fastBallPickupFactor: 0.75,
    fastBallSpeed: 220,
    goalkeeperPickupRadius: 13,
    goalkeeperCatchChance: 0.75,
    /** Tempo em que quem chutou não pode dominar a própria bola. */
    kickLockout: 0.3,
    /** Proteção contra desarme logo após ganhar a posse. */
    stealProtection: 0.45,
    goalkeeperHoldProtection: 1.4,
    goalkeeperHoldTime: 0.9,
  },
  pass: {
    shortRange: 240,
    throughRange: 300,
    longRange: 430,
    minDistance: 18,
    longMinDistance: 80,
    coneCos: 0.45,
    shortArrivalSpeed: 50,
    throughArrivalSpeed: 18,
    minSpeed: 90,
    maxSpeed: 270,
    leadTime: 0.3,
    throughLead: 58,
    fallbackShort: 130,
    fallbackThrough: 170,
    fallbackLong: 230,
    receiverWindow: 1.6,
  },
  shot: {
    speed: 330,
    maxLoft: 50,
    cornerFactor: 0.7,
    minSpread: 0.02,
    maxSpread: 0.14,
  },
  tackle: {
    range: 13,
    lungeSpeed: 150,
    lungeTime: 0.18,
    cooldown: 0.7,
    successChance: 0.7,
    failStun: 0.45,
    victimLockout: 0.45,
    stunSpeedFactor: 0.3,
  },
  ai: {
    decisionInterval: 0.25,
    decisionJitter: 0.2,
    receiveDelay: 0.3,
    pressureDistance: 24,
    tackleChance: 0.5,
  },
  match: {
    durationSeconds: 180,
    kickoffDelay: 1.2,
    goalCelebration: 2.4,
  },
} as const;
