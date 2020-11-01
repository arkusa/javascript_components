/* eslint-disable */
const linear = (t, b, c, d) => b + c * t / d;

const defaultProps = {
  duration: 1000,
  easingX: linear,
  easingY: linear,
  animationEnd: () => {},
  reduceEnergy: 1 / 2,
  vy: 0,
  container: document.body,
};

class Drop {
  constructor(props) {
    Object.assign(this, defaultProps, props);

    this.init();
    this.nodeMount();
    this.dropAnimationStart();
  }

  nodeMount() {
    const div = document.createElement('div');

    div.style.position = 'fixed';
    div.innerHTML = this.el;

    this.el = div;
    this.container.appendChild(div);
  }

  initStatus() {
    // 缓动曲线运动
    this.easingAnimation =
      typeof this.easingX === 'function' &&
      typeof this.easingY === 'function' &&
      (this.easingX !== linear || this.easingY !== linear)

    /* ------ 水平运动 --------- */
    this.averSpeedX = Math.abs((this.end.x - this.start.x)) / this.duration;
    this.maxSpeedX = 2 * this.averSpeedX;
    // 水平匀速运动, 且到达终点停止运行
    this.specialUnSpeedX = this.vx === undefined;
    /* ------ 水平运动 --------- */

    /* ------ 垂直运动 --------- */
    // 按照this.reduceEnergy 来消耗能量
    this.autoReduceEnergy = this.reboundCount === undefined;
    this.averSpeedY = Math.abs((this.end.y - this.start.y)) / this.duration;
    this.maxSpeedY = 2 * this.averSpeedY;
    // 第一次掉落到垂直终点时的速度
    let speedLock = false;
    let speed = null;
    Object.defineProperty(this, 'realMaxSpeedY', {
      get() {
        return speed; 
      },

      set(value) {
        if (speedLock) return;
        speedLock = true;
        speed = value;
      }
    });
    /* ------ 垂直运动 --------- */

    // 缩放
    this.scaleAnimation = this.start.scale !== undefined
      && this.end.scale !== undefined;

    this.rotateAnimation = this.start.rotate !== undefined
      && this.end.rotate !== undefined;

    this.opacityAnimation = this.start.opacity !== undefined
      && this.end.opacity !== undefined;
  }

  initMethod() {
    this.destory = this.destory.bind(this);
    this.renderNextAnimationFrame = this.renderNextAnimationFrame.bind(this);
    this.getNextAnimationFrame = this.getNextAnimationFrame.bind(this);
  }

  initProps() {
    // 水平运动的信息
    if (this.specialUnSpeedX) {
      this.vx = (this.end.x - this.start.x) / this.duration;
    } else {
      this.vx /= 1000;
      
      this.vx = this.vx > this.maxSpeedX ? this.maxSpeedX : this.vx;
      this.vx = this.vx < this.averSpeedX ? this.maxSpeedX : this.vx;
      this.vx = this.start.x > this.end.x ? 0 - this.vx : this.vx;
      this.ax = 
        2 * ((this.end.x - this.start.x) - this.vx * this.duration)
        / (this.duration * this.duration);
    }
    // 垂直运动的信息
    this.vy /= 1000;
    this.vy = this.vy > this.maxSpeedY ? this.maxSpeedY : this.vy;
    this.ay = 
      2 * ((this.end.y - this.start.y) - this.vy * this.duration)
      / (this.duration * this.duration);

    this.frame = Object.assign({}, this.start, {
      vx: this.vx,
      vy: this.vy,
    });

  }

  init() {
    this.initStatus();  
    this.initProps();
    this.initMethod();
  }

  dropAnimationStart() {
    this.animationStartTimestamp = new Date().getTime();

    this.animationId = window.requestAnimationFrame(this.renderNextAnimationFrame);
  }

  renderNextAnimationFrame(timestamp) {
    // console.log('run');
    const {
      x,
      y,
      opacity,
      rotate,
      scale,
    } = this.getNextAnimationFrame(timestamp);

    this.el.style.left = x + 'px';
    this.el.style.top = y + 'px';
    this.el.style.opacity = opacity;
    this.el.style.transform = `rotate(${rotate}deg) scale(${scale})`;

    if (!this.energyEnough()) {
      this.animationEnd(this.destory);
      window.cancelAnimationFrame(this.animationId);
    } else {
      this.animationId = window.requestAnimationFrame(this.renderNextAnimationFrame);
    }
  }

  easingFrame(time) {
    const frame = {};

    frame.x = this.easingX(time, this.start.x, this.end.x - this.start.x, this.duration);
    frame.y = this.easingY(time, this.start.y, this.end.y - this.start.y, this.duration);

    frame.x = Math.abs(this.end.x - this.start.x) > Math.abs(frame.x - this.start.x) ?
      frame.x :
      this.end.x;

    frame.y = frame.y >= this.end.y ? this.end.y : frame.y;

    return frame;
  }

  freeFallFrame(time, frameTimestamp) {
    return {
      ...this.getFreeFallVertialFrame(frameTimestamp),
      ...this.getFreeFallHorizontalFrame(time),
    };
  }

  getFreeFallVertialFrame(frameTimestamp) {
    const frame = {};

    const prevVy = this.frame.vy;

    frame.vy = this.frame.vy + this.ay * (frameTimestamp - (this.frame.timestamp || this.animationStartTimestamp));

    frame.y = (frame.vy * frame.vy - prevVy * prevVy) / (2 * this.ay) + this.frame.y;
    frame.y = frame.y >= this.end.y ? this.end.y : frame.y;
    frame.y = (prevVy > 0 && frame.vy < 0) ? this.end.y : frame.y;
    
    if (frame.y === this.end.y) {
      this.realMaxSpeedY = frame.vy; // 这个值是一个 setter 只能赋值一次

      frame.vy = 0 - frame.vy; 

      if (this.autoReduceEnergy) { // 按照比率消耗速度
        frame.vy = frame.vy * (1 - this.reduceEnergy);
      } else { // 按照次数动态计算消耗的速度
        frame.vy = frame.vy + this.realMaxSpeedY / 10 * 10 / (this.reboundCount + 1);
      }
      if (this.reboundCount === 0 || Math.abs(frame.vy) <= this.realMaxSpeedY / 10) {
        frame.vy = 0;
        this.ay = 0;
      }
    }

    frame.timestamp = frameTimestamp;

    return frame;
  }

  getFreeFallHorizontalFrame(time) {
    const frame = {}
    if (this.specialUnSpeedX) { // 匀速直线运动, 到达终点停止
      frame.x = this.start.x + time * this.vx;

      frame.x = Math.abs(this.end.x - this.start.x) >= Math.abs(frame.x - this.start.x) ?
        frame.x :
        this.end.x; 
    } else { // 匀减速直线运动，可以到达终点，但是不停止
      frame.vx = this.vx + this.ax * time; 
      frame.x = this.start.x + this.vx * time + this.ax * time * time / 2;

      frame.x = 
        (this.end.x - this.start.x > 0 && frame.vx > 0) ||
        (this.end.x - this.start.x < 0 && frame.vx < 0) ?
        frame.x :
        frame.prevX; 

      frame.prevX = frame.x;
    }

    return frame;
  }

  scaleFrame(time) {
    return {
      scale: this.scaleAnimation ?
        (time <= this.duration ? 
          linear(time, this.start.scale, this.end.scale - this.start.scale, this.duration) :
          this.end.scale
        ) :  
        1,
    }
  }

  opacityFrame(time) {
    return {
      opacity: this.opacityFrame ?
        (time <= this.duration ? 
          linear(time, this.start.opacity, this.end.opacity - this.start.opacity, this.duration) :
          this.end.opacity
        ) :
        1,
    }
  }

  rotateFrame(time) {
    return {
      rotate: this.rotateAnimation ?
        (time <= this.duration ? 
          linear(time, this.start.rotate, this.end.rotate - this.start.rotate, this.duration) :
          this.end.rotate
        ) :
        0,
    }
  }

  getNextAnimationFrame(timestamp) {
    const frameTimestamp = new Date().getTime();
    const time = frameTimestamp - this.animationStartTimestamp

    let frame = null;

    if (this.easingAnimation) {
      frame = this.easingFrame(time);
    } else {
      frame = this.freeFallFrame(time, frameTimestamp);
    }

    
    this.frame = {
      ...this.frame,
      ...frame,
      ...this.opacityFrame(time),
      ...this.scaleFrame(time),
      ...this.rotateFrame(time),
    };

    return this.frame;
  }

  energyEnough() {
    return this.easingAnimation ?
      Math.abs(this.start.y - this.frame.y) < Math.abs(this.start.y - this.end.y) :
      (this.specialUnSpeedX && this.frame.x !== this.end.x) ||
      (!this.specialUnSpeedX && this.end.x - this.start.x > 0 && this.frame.vx > 0) ||
      (!this.specialUnSpeedX && this.end.x - this.start.x < 0 && this.frame.vx < 0) || 
      this.ay != 0;
  }

  destory() {
    this.container.removeChild(this.el);
  }
}
