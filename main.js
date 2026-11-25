let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let can_h = 1080;
let can_w = 1920;

canvas.width = can_w;
canvas.height = can_h;

let enemys = [];
let bullets = [];
let kills = 0;
let pause = 0;
let hp = 1000;
let shotTimer = 0;
let player;

const keys = { up: false, down: false, left: false, right: false };

class Player {
    constructor(x, y, color, scale, speed = 7) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.scale = scale;
        this.speed = speed;
    }

    Render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.x, this.y, this.scale, this.scale);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgb(231, 44, 44)';
        ctx.rect(this.x, this.y + this.scale + 8, this.scale, 6);
        ctx.fill();

        let hpWidth = this.scale * (hp / 1000);
        if (hpWidth > 0) {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(44, 231, 44)';
            ctx.rect(this.x, this.y + this.scale + 8, hpWidth, 6);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.rect(this.x, this.y + this.scale + 8, this.scale, 6);
        ctx.stroke();
    }

    tryshot() {
        let target = this.find();
        if (target && shotTimer >= 45) {
            let newBullet = new Bullet(this.x + this.scale / 2, this.y + this.scale / 2);
            newBullet.SetTarget(target);
            bullets.push(newBullet);
            shotTimer = 0;
        }
    }

    Update() {
        if (pause === 0) {
            if (keys.right && this.x + this.speed <= ctx.canvas.width - this.scale) { this.x += this.speed; }
            if (keys.left && this.x - this.speed >= 0) { this.x -= this.speed; }
            if (keys.down && this.y + this.speed <= ctx.canvas.height - this.scale) { this.y += this.speed; }
            if (keys.up && this.y - this.speed >= 0) { this.y -= this.speed; }
        }
    }

    find() {
        let target = null;
        let min = Infinity;
        for (let i = 0; i < enemys.length; i++) {
            let dist = Math.hypot(enemys[i].x - this.x, enemys[i].y - this.y);
            if (dist < min) {
                min = dist;
                target = enemys[i];
            }
        }
        if (target) {
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.moveTo(this.x + this.scale / 2, this.y + this.scale / 2);
            ctx.lineTo(target.x + 12, target.y + 12);
            ctx.stroke();
        }
        return target;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.enemy = null;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    SetTarget(target) {
        this.enemy = target;
    }

    moveToTarget() {
        if (this.enemy) {
            this.x += (this.enemy.x + 12 - this.x) * 0.1;
            this.y += (this.enemy.y + 12 - this.y) * 0.1;
        }
    }

    die() {
    if (!this.enemy) return;
    
    let distance = Math.hypot((this.enemy.x + 12) - this.x, (this.enemy.y + 12) - this.y);
    
    if (distance < 10) {
        this.isAlive = false;
        
        for (let i = 0; i < enemys.length; i++) {
            let targetDistance = Math.hypot((enemys[i].x + 12) - this.x, (enemys[i].y + 12) - this.y);
            
            if (targetDistance < 25) {
                enemys[i].hp -= 10;
                
                if (enemys[i].hp <= 0) {
                    enemys[i].die();
                    kills++;
                }
            }
        }
        
        this.enemy = null;
    }
}
}

class Enemy {
    constructor(x, y, speed, r, g, b) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.r = r;
        this.g = g;
        this.b = b;
        this.hp = 30;
        this.maxHp = 30;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
        ctx.rect(this.x, this.y, 25, 25);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgb(231, 44, 44)';
        ctx.rect(this.x, this.y - 10, 25, 4);
        ctx.fill();

        let enemyHpWidth = 25 * (this.hp / this.maxHp);
        if (enemyHpWidth > 0) {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(44, 231, 44)';
            ctx.rect(this.x, this.y - 10, enemyHpWidth, 4);
            ctx.fill();
        }
    }

    dvig1() {
        let playerCenterX = player.x + (player.scale / 2);
        let playerCenterY = player.y + (player.scale / 2);

        if (this.x < playerCenterX) this.x += this.speed;
        if (this.x > playerCenterX) this.x -= this.speed;
        if (this.y < playerCenterY) this.y += this.speed;
        if (this.y > playerCenterY) this.y -= this.speed;
    }

    die() {
        let x = Math.floor(Math.random() * can_w);
        let y = Math.floor(Math.random() * can_h);

        if (x > can_w / 2) { x += (can_w / 2); } else { x -= (can_w / 2); }
        if (y > can_h / 2) { y += (can_h / 2); } else { y -= (can_h / 2); }

        this.r = Math.floor(Math.random() * 255);
        this.g = Math.floor(Math.random() * 255);
        this.b = Math.floor(Math.random() * 255);
        this.x = x;
        this.y = y;
        this.hp = this.maxHp;
    }
}

function drawBG() {
    ctx.beginPath();
    ctx.fillStyle = '#A08F65';
    ctx.rect(0, 0, can_w, can_h);
    ctx.fill();
}

function negEnemy() {
    for (let i = 0; i < 20; i++) {
        let x, y;
        let side = Math.floor(Math.random() * 4);
        let speed = 0.5 + Math.floor(Math.random()) * 0.5;
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);

        if (side === 0) { x = Math.floor(Math.random()) * can_w; y = -30; }
        if (side === 1) { x = Math.floor(Math.random()) * can_w; y = can_h + 30; }
        if (side === 2) { x = -30; y = Math.floor(Math.random()) * can_h; }
        if (side === 3) { x = can_w + 30; y = Math.floor(Math.random()) * can_h; }

        let enemy = new Enemy(x, y, speed, r, g, b);
        enemys.push(enemy);
    }
}

function Animate() {
    drawBG();

    ctx.fillStyle = 'black';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('НЕГРЫ: ' + kills, 20, 25);

    if (pause === 0) {
        player.Update();

        for (let i = 0; i < enemys.length; i++) {
            const enemy = enemys[i];
            enemy.dvig1();
        }

        shotTimer++;
        player.tryshot();
    }

    player.Render();

    for (let i = 0; i < enemys.length; i++) {
        const enemy = enemys[i];
        enemy.render();

        let distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (distToPlayer < 35 && pause === 0) {
            hp -= 0.3;
            if (hp <= 0) {
                hp = 0;
                pause = 1;
            }
        }
    }

    for (let b = 0; b < bullets.length; b++) {
        const currentBullet = bullets[b];

        if (currentBullet.isAlive) {
            if (pause === 0) {
                currentBullet.moveToTarget();
                currentBullet.die();
            }
            currentBullet.render();
        } else {
            bullets.splice(b, 1);
            b--;
        }
    }

    requestAnimationFrame(Animate);
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        if (pause === 0) {
            pause = 1;
        } else {
            pause = 0;
        }
    }

    switch (e.key.toLowerCase()) {
        case 'd': case 'в': keys.right = true; break;
        case 'a': case 'ф': keys.left = true; break;
        case 's': case 'ы': keys.down = true; break;
        case 'w': case 'ц': keys.up = true; break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'd': case 'в': keys.right = false; break;
        case 'a': case 'ф': keys.left = false; break;
        case 's': case 'ы': keys.down = false; break;
        case 'w': case 'ц': keys.up = false; break;
    }
});

function setup() {
    player = new Player(275, 275, 'white', 50, 4);
    bullets = [];
    enemys = [];
    shotTimer = 60;
    negEnemy();
    Animate();
}

setup();