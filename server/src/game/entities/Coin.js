const Entity = require('./Entity');
const Circle = require('../shapes/Circle');
const Types = require('../Types');
const helpers = require('../../helpers');

class Coin extends Entity {

  static defaultDefinition = {
    forbiddenEntities: [Types.Entity.IceSpike],
  };

  constructor(game, objectData) {
    super(game, Types.Entity.Coin, objectData);
    if(typeof objectData.value === 'number') objectData.value = [objectData.value, objectData.value];
    objectData.value = Array.isArray(objectData.value) ? objectData.value : [1, 1];
    this.value = helpers.randomInteger(objectData.value[0], objectData.value[1]);
    const radius = Math.min(300, 80 + this.value * 10);

    this.shape = Circle.create(0, 0, radius);
    this.targets.push(Types.Entity.Player);
    this.hunterId = null;

    // Despawn coin after 2 minutes
    this.despawnTime = Date.now() + (1000 * 60 * 2);

    this.spawn();
  }

  update() {
    this.shape.x += this.velocity.x;
    this.shape.y += this.velocity.y;
    this.velocity.scale(0.5);

    if (Date.now() > this.despawnTime) {
      if(this.respawnable) this.createInstance();
      this.remove();
    }
  }

  createState() {
    const state = super.createState();
    if (this.removed) {
      state.hunterId = this.hunterId;
    }
    return state;
  }

  processTargetsCollision(player) {
    player.levels.addCoins(this.value);
    player.flags.set(Types.Flags.GetCoin, true);
    this.hunterId = player.id;

    if (this.respawnable) this.createInstance();
    this.remove();
  }
}

module.exports = Coin;
