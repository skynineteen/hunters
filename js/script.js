class Rabbit {
  constructor() {
    this._x = 50;
    this._y = 50;
    this._hunters = [];
    this.running;
    this.isAlive = true;
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  set x(x) {
    this._x = x;
  }
  set y(y) {
    this._y = y;
  }

  on(callback) {
    this._hunters.push(callback);

    return () => {
      this._hunters = this._hunters.filter(cb => cb !== callback);
    };
  }

  run() {
    this.running = setInterval(() => {
      this.x = Math.floor(Math.random() * 85 + 7);
      this.y = Math.floor(Math.random() * 83 + 7);
      console.log('The rabbit is running:' + this.x + ', ' + this.y);
      this._hunters.forEach(cb => cb(this.x, this.y));
      document.querySelector('.bunny').style = `top: ${this.y}%; left: ${
        this.x
      }%`;
    }, 1000);
  }

  stop() {
    clearInterval(this.running);
  }

  die() {
    this.isAlive = false;
    this.stop();
    document.querySelector('.bunny').classList.add('dead');
    // this._hunters.length = 0;
  }
}

class Hunter {
  constructor(name, rabbit) {
    this.name = name;
    this.rabbit = rabbit;
    this.rabbitX = 50;
    this.rabbitY = 50;
    this.fireX = 50;
    this.fireY = 50;
    this.firing;
  }

  watch() {
    return (x, y) => {
      this.rabbitX = x;
      this.rabbitY = y;
      console.log(`${this.name} is watching: ${this.rabbitX}, ${this.rabbitY}`);
      document
        .querySelectorAll('.coordinates__x')
        .forEach(item => (item.textContent = x));
      document
        .querySelectorAll('.coordinates__y')
        .forEach(item => (item.textContent = y));
    };
  }

  startWatch() {
    this.off = this.rabbit.on(this.watch());
  }

  stopWatch() {
    this.off();
  }

  fire() {
    this.firing = setInterval(() => {
      if (this.rabbit.isAlive) {
        const aim = document.querySelector('.aim');
        this.fireX = this.rabbitX + Math.floor(Math.random() * 8);
        this.fireY = this.rabbitY + Math.floor(Math.random() * 8);
        console.log(`${this.name} - fire! - ${this.fireX}, ${this.fireY}`);
        aim.classList.remove('hide');
        aim.style = `top: ${this.fireY}%; left: ${this.fireX}%`;
        if (this.fireX - this.rabbitX < 3 && this.fireY - this.rabbitY < 3) {
          this.rabbit.die();
          this.stopWatch();
          this.stopFire();
          this.showModal();
          console.log(`${this.name} is a winner!`);
        }
      }
    }, 1000);
  }

  stopFire() {
    clearInterval(this.firing);
    document.querySelector('.aim').classList.add('hide');
  }

  showModal() {
    const modal = document.querySelector('.modal');
    modal.classList.add('show');
    modal.textContent = `${this.name} won!`;
  }
}

class View {
  constructor(rootElement, rabbit) {
    this.rootElement = rootElement;
    this.rabbit = rabbit;
    this.hunters = [];
  }
  render() {
    const meadow = document.createElement('div');
    meadow.classList.add('meadow');

    const bunny = document.createElement('div');
    bunny.classList.add('bunny');

    const sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');

    const buttonRun = document.createElement('button');
    buttonRun.classList.add('run');
    buttonRun.type = 'button';
    buttonRun.innerText = 'Run';
    buttonRun.addEventListener('click', () => {
      this.rabbit.run();
      bunny.classList.add('move');
      bunny.style = `top: ${this.rabbit.y}%; left: ${this.rabbit.x}%`;
    });

    const buttonStop = document.createElement('button');
    buttonStop.classList.add('stop');
    buttonStop.type = 'button';
    buttonStop.innerText = 'Stop';
    buttonStop.addEventListener('click', () => {
      this.rabbit.stop();
      bunny.classList.remove('move');
    });

    const hunters = document.createElement('div');
    hunters.classList.add('hunters');

    const buttonAdd = document.createElement('button');
    buttonAdd.classList.add('add');
    buttonAdd.type = 'button';
    buttonAdd.innerText = 'Add a hunter';
    buttonAdd.addEventListener('click', () => {
      if (this.rabbit._hunters.length < 3) {
        if (this.rabbit._hunters.length >= 0) {
          buttonRemove.classList.remove('hide');
        }
        const hunter = new Hunter(
          `Hunter ${this.hunters.length + 1}`,
          this.rabbit
        );

        hunter.startWatch();
        hunter.fire();

        this.hunters.push(hunter);

        const hunterItem = document.createElement('div');
        hunterItem.classList.add('hunters__item');
        hunterItem.setAttribute('name', hunter.name);
        const coordinates = document.createElement('div');
        coordinates.classList.add('coordinates');

        const coordinatesX = document.createElement('div');
        coordinatesX.textContent = hunter.rabbitX;
        coordinatesX.classList.add('coordinates__x');
        coordinates.appendChild(coordinatesX);

        const coordinatesY = document.createElement('div');
        coordinatesY.textContent = hunter.rabbitY;
        coordinatesY.classList.add('coordinates__y');
        coordinates.appendChild(coordinatesY);

        hunters.appendChild(hunterItem);
        hunters.appendChild(coordinates);
        meadow.appendChild(aim);
      }
      if (this.hunters.length === 3) {
        buttonAdd.setAttribute('disabled', 'disabled');
      }
    });

    const buttonRemove = document.createElement('button');
    buttonRemove.classList.add('remove');
    buttonRemove.classList.add('hide');
    buttonRemove.type = 'button';
    buttonRemove.innerText = 'Remove hunter';
    buttonRemove.addEventListener('click', () => {
      if (this.hunters.length !== 0) {
        this.hunters[this.hunters.length - 1].stopWatch();
        this.hunters[this.hunters.length - 1].stopFire();
        this.hunters.pop();
        const huntersItems = document.querySelectorAll('.hunters__item');
        const coordinates = document.querySelectorAll('.coordinates');
        hunters.removeChild(huntersItems[huntersItems.length - 1]);
        hunters.removeChild(coordinates[coordinates.length - 1]);
      }
      if (this.hunters.length === 0) {
        buttonRemove.classList.add('hide');
      }
      if (this.hunters.length < 3) {
        buttonAdd.removeAttribute('disabled');
      }
    });

    const aim = document.createElement('div');
    aim.classList.add('aim');
    aim.classList.add('hide');

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.classList.add('transparent');

    this.rootElement.appendChild(meadow);
    this.rootElement.appendChild(sidebar);
    this.rootElement.appendChild(modal);
    meadow.appendChild(bunny);
    meadow.appendChild(aim);
    sidebar.appendChild(buttonRun);
    sidebar.appendChild(buttonStop);
    sidebar.appendChild(hunters);
    sidebar.appendChild(buttonAdd);
    sidebar.appendChild(buttonRemove);
  }
}

// Build
const app = document.getElementById('app');

const rabbit = new Rabbit();
const view = new View(app, rabbit);

view.render();
