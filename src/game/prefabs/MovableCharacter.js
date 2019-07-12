import Phaser from 'phaser'

const MOVE_TIMER = 3

export default class MovableCharacter extends Phaser.Physics.Arcade.Sprite {
  constructor (scene, x, y, texture) {
    super(scene, x, y, texture, 1)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setSize(18, 22) // 16 x 20 || 18x22
    this.setDisplayOrigin(9, 13) // 16 - 8, 20 - 8 || 18 - (8 + 1), 22 - (8 + 1)
    this.setCollideWorldBounds(true)

    this.isMoving = false
    this.speed = 2 // 1
    this.lastKey = null
    this.steps = 0
    this.faces = 'down'
    this.moveTimer = MOVE_TIMER

    this.cursors = this.scene.input.keyboard.createCursorKeys()

    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers('player', { frames: [6, 7, 8, 7] }),
      frameRate: 10,
      repeat: -1
    })

    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers('player', { frames: [6, 7, 8, 7] }),
      frameRate: 10,
      repeat: -1
    })

    this.scene.anims.create({
      key: 'up',
      frames: this.scene.anims.generateFrameNumbers('player', { frames: [3, 4, 5, 4] }),
      frameRate: 10,
      repeat: -1
    })

    this.scene.anims.create({
      key: 'down',
      frames: this.scene.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 1] }),
      frameRate: 10,
      repeat: -1
    })
  }

  update (args) {
    // console.log(this.x, this.y)

    if (!this.isMoving) {
      // this.body.setVelocity(0)

      // Movements
      if (this.cursors.left.isDown) {
        // this.body.setVelocityX(-32)
        this.moveTo('left')
      } else if (this.cursors.right.isDown) {
        // this.body.setVelocityX(32)
        this.moveTo('right')
      } else if (this.cursors.up.isDown) {
        // this.body.setVelocityY(-32)
        this.moveTo('up')
      } else if (this.cursors.down.isDown) {
        // this.body.setVelocityY(32)
        this.moveTo('down')
      } else {
        this.stopMoving()
      }
    } else {
      this.continueMoving()
    }
  }

  moveTo (direction) {
    this.flipX = direction === 'right'
    this.anims.play(direction, true)
    if (this.canMoveTo(this.getNextPosition(direction).x, this.getNextPosition(direction).y)) {
      this.isMoving = true
      this.lastKey = direction
      this.move(this.lastKey)
    }
    this.faces = direction
  }

  stopMoving () {
    this.anims.stop()
    this.setFrame(this.getIdleFrame())
    this.isMoving = false
    this.lastKey = null
    this.moveTimer = MOVE_TIMER
  }

  continueMoving () {
    this.steps++
    this.move(this.lastKey)
    if (this.steps === ((16 / this.speed) - 1)) { // 15 if speed === 1
      this.isMoving = false
      this.steps = 0
      this.moveTimer = MOVE_TIMER
    }
  }

  getNextPosition (direction) {
    switch (direction) {
      case 'left':
        return {
          x: this.x - 16,
          y: this.y
        }
      case 'right':
        return {
          x: this.x + 16,
          y: this.y
        }
      case 'up':
        return {
          x: this.x,
          y: this.y - 16
        }
      case 'down':
        return {
          x: this.x,
          y: this.y + 16
        }
      default:
        return {
          x: this.x,
          y: this.y
        }
    }
  }

  move (direction) {
    switch (direction) {
      case 'left':
        this.x -= this.speed
        break
      case 'right':
        this.x += this.speed
        break
      case 'up':
        this.y -= this.speed
        break
      case 'down':
        this.y += this.speed
        break
      default:
    }
  }

  canMoveTo (x, y) {
    // console.log(this.moveTimer)
    // Wait for a certain amount of time before really moving
    if (this.moveTimer === 0 || this.lastKey != null) {
      this.moveTimer = MOVE_TIMER
      // console.log(x, y)
      let nextTile = this.scene.map.getTileAtWorldXY(x, y)
      // console.log(nextTile)
      return nextTile && !nextTile.collides
    } else {
      this.moveTimer--
    }
  }

  getIdleFrame () {
    switch (this.faces) {
      case 'left':
      case 'right':
        return 7
      case 'up':
        return 4
      default:
        return 1
    }
  }

  isFullyOnTile () {
    return ((this.x - 8) % 16 === 0) && ((this.y - 8) % 16 === 0)
  }

  moveAlongPath (path) {
    console.log(path)
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    let tweens = []
    for (let i = 0; i < path.length - 1; i++) {
      let currentX = path[i].x
      let currentY = path[i].y
      let nextX = path[i + 1].x
      let nextY = path[i + 1].y
      tweens.push({
        targets: this,
        x: { value: nextX * this.scene.map.tileWidth + 8, duration: 200 },
        y: { value: nextY * this.scene.map.tileHeight + 8, duration: 200 },
        onStart: () => {
          this.isMoving = true
          if (nextX < currentX && nextY === currentY) {
            // Left
            this.flipX = false
            this.anims.play('left', true)
            this.faces = 'left'
          } else if (nextX > currentX && nextY === currentY) {
            // Right
            this.flipX = true
            this.anims.play('right', true)
            this.faces = 'right'
          } else if (nextY < currentY && nextX === currentX) {
            // Up
            this.anims.play('up', true)
            this.faces = 'up'
          } else if (nextY > currentY && nextX === currentX) {
            // Bas
            this.anims.play('down', true)
            this.faces = 'down'
          }
        },
        onComplete: () => {
          this.isMoving = false
          this.anims.stop()
          this.setFrame(this.getIdleFrame())
        }
      })
    }

    this.scene.tweens.timeline({
      tweens
    })
  }
}
