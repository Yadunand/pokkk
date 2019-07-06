import MovableCharacter from './MovableCharacter'

export default class Player extends MovableCharacter {
  constructor (scene, x, y) {
    super(scene, x, y, 'player')
  }

  update (args) {
    // console.log(this.x, this.y)
    this.scene.cameras.main.startFollow(this)
    super.update(args)
  }

  getNextTile () {
    switch (this.faces) {
      case 'left':
        return this.scene.map.getTileAtWorldXY(this.x - 16, this.y)
      case 'right':
        return this.scene.map.getTileAtWorldXY(this.x + 16, this.y)
      case 'up':
        return this.scene.map.getTileAtWorldXY(this.x, this.y - 16)
      case 'down':
        return this.scene.map.getTileAtWorldXY(this.x, this.y + 16)
      default:
    }
  }
}
