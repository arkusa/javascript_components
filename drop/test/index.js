/* eslint-disable */
const quad = {
  easeIn: (t, b, c, d) => c * (t /= d) * t + b,
};
function demo1() {
  const el = `<div
    style="
      position: absolute;
      top: -10px;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      background-image: linear-gradient(red, yellow);
    "
  >
  </div>`;
  const demo = document.getElementById('demo1');
  const endDom = demo.getElementsByClassName('end')[0];
  const container = demo.getElementsByClassName('start')[0];
  const startInfo = container.getBoundingClientRect();
  const endInfo = endDom.getBoundingClientRect();

  const start = {
      x: (startInfo.x || startInfo.left),
      y: (startInfo.y || startInfo.top),
  };
  const end = {
      x: (endInfo.x || endInfo.left),
      y: (endInfo.y || endInfo.top),
  };

  const texts = demo.getElementsByClassName('text');
  texts[0].innerHTML += `(${start.x}, ${start.y})`;
  texts[1].innerHTML += `(${end.x}, ${end.y})`;
  texts[2].innerHTML += `${quad.easeIn}`;
  texts[3].innerHTML += `${quad.easeIn}`;

  function dropAnimate() {
    const instance = new Drop({
      el,
      container,
      easingX: quad.easeIn,
      easingY: quad.easeIn,
      start,
      end,
      duration: 1000,
      animationEnd(destory) {
        setTimeout(() => {
          destory();
          dropAnimate();
        }, 1000);
      }
    });
  }

  dropAnimate();
};

function demo2() {
  const el = `<div
    style="
      position: absolute;
      top: -10px;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      background-image: linear-gradient(red, yellow);
    "
  >
  </div>`;
  const demo = document.getElementById('demo2');
  const endDom = demo.getElementsByClassName('end')[0];
  const container = demo.getElementsByClassName('start')[0];
  const startInfo = container.getBoundingClientRect();
  const endInfo = endDom.getBoundingClientRect();
  
  const start = {
    x: (startInfo.x || startInfo.left),
    y: (startInfo.y || startInfo.top),
  };
  const end = {
    x: (endInfo.x || endInfo.left),
    y: (endInfo.y || endInfo.top),
  };

  // 期望每次向上的位移是50px;
  // 所以抛物线的极值点的纵坐标应该是-100 / (end.y - start.y)
  let y = -80 / (end.y - start.y);
  // 代入 a + b = 1 和 (4*a*c - b * b) / 4 * a = y 和 c = 0
  // 得到 a 和 b
  const b1 = (4 * y - Math.sqrt(16 * y * y - 16 * y)) / 2;
  const a1 = 1 - b1;

  const easingX = quad.easeIn;
  const easingY = (t, b, c, d) => (a1 * (t /= d) * t + b1 * t) * c + b

  const texts = demo.getElementsByClassName('text');
  texts[0].innerHTML += `(${start.x}, ${start.y})`;
  texts[1].innerHTML += `(${end.x}, ${end.y})`;
  texts[2].innerHTML += `${easingX}`;
  texts[3].innerHTML += `${easingY}`;
  texts[4].innerHTML += `f(x) = ${a1} * x * x + ${b1} * x`

  function dropAnimate() {
    const instance = new Drop({
      el,
      container,
      end,
      start,
      easingX,
      easingY,
      duration: 1000,
      animationEnd(destory) {
        setTimeout(() => {
          destory();
          dropAnimate();
        }, 1000);
      }
    });
  }

  dropAnimate();
};

function demo3() {
  const el = `<div
    style="
      position: absolute;
      top: -10px;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      background-image: linear-gradient(red, yellow);
    "
  >
  </div>`;
  const demo = document.getElementById('demo3');
  const endDom = demo.getElementsByClassName('end')[0];
  const container = demo.getElementsByClassName('start')[0];
  const startInfo = container.getBoundingClientRect();
  const endInfo = endDom.getBoundingClientRect();

  const start = {
      x: (startInfo.x || startInfo.left),
      y: (startInfo.y || startInfo.top),
  };
  const end = {
      x: (endInfo.x || endInfo.left),
      y: (endInfo.y || endInfo.top),
  };

  const texts = demo.getElementsByClassName('text');
  texts[0].innerHTML += `(${start.x}, ${start.y})`;
  texts[1].innerHTML += `(${end.x}, ${end.y})`;

  function dropAnimate() {
    const instance = new Drop({
      el,
      container,
      start,
      end,
      vy: -500,
      duration: 1000,
      animationEnd(destory) {
        setTimeout(() => {
          destory();
          dropAnimate();
        }, 1000);
      }
    });
  }

  dropAnimate();
};

function demo4() {
  const el = `<div
    style="
      position: absolute;
      top: -10px;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      background-image: linear-gradient(red, yellow);
    "
  >
  </div>`;
  const demo = document.getElementById('demo4');
  const endDom = demo.getElementsByClassName('end')[0];
  const container = demo.getElementsByClassName('start')[0];
  const startInfo = container.getBoundingClientRect();
  const endInfo = endDom.getBoundingClientRect();

  const start = {
      x: (startInfo.x || startInfo.left),
      y: (startInfo.y || startInfo.top),
  };
  const end = {
      x: (endInfo.x || endInfo.left),
      y: (endInfo.y || endInfo.top),
  };

  const texts = demo.getElementsByClassName('text');
  texts[0].innerHTML += `(${start.x}, ${start.y})`;
  texts[1].innerHTML += `(${end.x}, ${end.y})`;

  function dropAnimate() {
    const instance = new Drop({
      el,
      container,
      start,
      end,
      vy: -500,
      vx: 300,
      duration: 1000,
      animationEnd(destory) {
        setTimeout(() => {
          destory();
          dropAnimate();
        }, 1000);
      }
    });
  }

  dropAnimate();
};

document.addEventListener('DOMContentLoaded', () => {
  demo1();
  demo2();
  demo3();
  demo4();
});
