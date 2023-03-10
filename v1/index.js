     /**@type {HTMLCanvasElement} */
window.addEventListener('load',function() {
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
const fullScreenButton =  document.getElementById('fullScreen');
const CANVAS_WIDTH = canvas.width = 1300;
const CANVAS_HEIGHT = canvas.height = 720;
let enemies=[];
let timeToNextEnemy = 0;
let enemyInterval = 1000;
let randomEnemyInterval = Math.random() * 1000 + 500;
let score = 0;
let gameOver = false;
class InputHandler {
    constructor(){
        this.keys = [];
        this.touchY = '';
        this.touchTreshold = 30;
        window.addEventListener('keydown', (e) => {
            if (
                (
                    e.key == 'ArrowDown'||
                    e.key == 'ArrowUp' ||
                    e.key=='ArrowLeft'||
                    e.key=='ArrowRight'
                ) 
                && this.keys.indexOf(e.key)=== -1) 
            {
                this.keys.push(e.key);
            }
            else if (e.key === 'Enter' && gameOver) {
                restartGame()
            }
        })
        window.addEventListener('keyup', (e) => {
            if 
                (
                    e.key == 'ArrowDown'||
                    e.key == 'ArrowUp' ||
                    e.key=='ArrowLeft'||
                    e.key=='ArrowRight'
                ) 
            {
                this.keys.splice(this.keys.indexOf(e.key),1);
            }
        })
        window.addEventListener('touchstart',(e)=>{
            this.touchY = e.changedTouches[0].pageY
        })
        window.addEventListener('touchmove',(e)=>{
            const swipDistance = e.changedTouches[0].pageY - this.touchY
            if(swipDistance < -this.touchTreshold && this.keys.indexOf('swipe up')=== -1) this.keys.push('swipe up')
            else if (swipDistance > this.touchTreshold && this.keys.indexOf('swipe down')=== -1) {
                this.keys.push('swipe down')
                if (gameOver) {
                    restartGame()
                }
            }
        })   
        window.addEventListener('touchend',(e)=>{
            console.log(this.keys);
            this.keys.splice(this.keys.indexOf('swipe up'),1)
            this.keys.splice(this.keys.indexOf('swipe down'),1)
        })
    }

}
class Player{
    constructor(gameWidth , gameHeight){
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width =200 ;
        this.height = 200 ;
        this.x = 100 ;
        this.y = this.gameHeight - this.height;
        this.image = document.getElementById('playerImage')
        this.frameX = 0;
        this.maxFrame = 8;
        this.fbs =20;
        this.frameTimer =0;
        this.frameInterval = 1000/this.fbs
        this.frameY = 0;
        this.speed = 0;
        this.vy = 0;
        this.weight =1;
    }
    restart(){
        this.x = 100 ;
        this.y = this.gameHeight - this.height;
        this.maxFrame = 8;
        this.frameY = 0;
    }
    draw(context){
        // context.fillStyle = 'white';
        // context.fillRect(this.x,this.y,this.width,this.height);
        // context.drawImage(this.image ,0 ,0 , this.width ,this.height ,this.x ,this.y , this.width ,this.height);
        // context.strokeStyle = 'white'
        // context.strokeRect(this.x,this.y,this.width,this.height)
        // context.beginPath();
        // context.arc(this.x+this.width/2,this.y+this.width/2,this.width/2,0,Math.PI * 2)
        // context.stroke();
        // context.strokeStyle = 'blue'
        // context.beginPath();
        // context.arc(this.x,this.y,this.width/2,0,Math.PI * 2)
        // context.stroke();
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height ,this.x ,this.y ,this.width,this.height);
    }
    update(input,deltaTime,enemies){
        enemies.forEach(enemy=>{
            const dx = (this.x + this.width/2) - (enemy.x +enemy.width/2);
            const dy = (this.y+ this.height/2) - (enemy.y+enemy.height/2);
            const distance = Math.sqrt(dx * dx +dy * dy)
            if (distance <= this.width/2 + enemy.width/2 ) gameOver = true 
                
        })
        if (this.frameTimer > this.frameInterval) {
            if(this.frameX >= this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.frameTimer=0;
        }else{
            this.frameTimer+=deltaTime;
        }
        this.x += this.speed;
        if (input.keys.indexOf('ArrowRight')>-1) {
            this.speed = 5;
        }
        else{
            if (input.keys.indexOf('ArrowLeft')>-1) {
                this.speed = -5;
            }
            else{
                this.speed = 0;
            }

        }
        if ((input.keys.indexOf('ArrowUp')>-1 || input.keys.indexOf('swipe up')>-1) && this.onGround()) {
            this.vy -= 32;
        }
     
        
        if(this.x < 0) this.x=0
        else if(this.x > this.gameWidth - this.width) this.x =this.gameWidth-this.width

        this.y += this.vy
        if (!this.onGround()) {
            this.vy += this.weight
            this.maxFrame = 5;
            this.frameY=1;
        }
        else{
            this.maxFrame = 8;
            this.frameY=0;
            this.vy =0;
        }
        if(this.y > this.gameHeight - this.height) this.y=this.gameHeight - this.height
    }
    onGround(){
        return this.y >= this.gameHeight - this.height
    }
    
}

class Background {
    constructor(gameWidth , gameHeight){
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.image = document.getElementById("background_single");
        this.x=0;
        this.y=0;
        this.width=2400;
        this.height = 720;
        this.speed = -10;
    }
    draw(context){
        context.drawImage(this.image,this.x,this.y,this.width,this.height);
        context.drawImage(this.image,this.x+this.width + this.speed,this.y,this.width,this.height);
    }
    update(){
        this.x += this.speed;
        if (this.x < 0 - this.width) {
            this.x = 0;
        }
    }
    restart(){
        this.x = 0;
    }
}
class Enemy {
    constructor(gameWidth , gameHeight){
        this.gameHeight=gameHeight;
        this.gameWidth = gameWidth;
        this.width =160;
        this.height=119;
        this.image=document.getElementById("enemyImage");
        this.x=this.gameWidth;
        this.y = this.gameHeight - this.height;
        this.frameX=0;
        this.maxFrame=5;
        this.fbs =20;
        this.frameTimer =0;
        this.frameInterval = 1000/this.fbs
        this.speed=8;
        this.markedForDeletion = false;
    }
    update(deltaTime){
        if(this.x < 0) {
            this.markedForDeletion=true
            score++
        };
        if (this.frameTimer > this.frameInterval) {
            if(this.frameX >= this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.frameTimer=0;
        }else{
            this.frameTimer+=deltaTime;
        }

        this.x-=this.speed;
    }
    draw(context){
        // context.strokeStyle = 'white'
        // context.strokeRect(this.x,this.y,this.width,this.height)
        // context.beginPath();
        // context.arc(this.x+this.width/2,this.y+this.height/2,this.width/2,0,Math.PI * 2)
        // context.stroke();
        // context.strokeStyle = 'blue'
        // context.beginPath();
        // context.arc(this.x,this.y,this.width/2,0,Math.PI * 2)
        // context.stroke();
        context.drawImage(this.image,this.width* this.frameX,0,this.width,this.height,this.x,this.y,this.width,this.height);
    }
}

 
function handleEnemies(deltaTime) {
    if (timeToNextEnemy > enemyInterval + randomEnemyInterval) {
        enemies.push(new Enemy(CANVAS_WIDTH,CANVAS_HEIGHT))
        randomEnemyInterval = Math.random() * 1000 + 500;
        timeToNextEnemy = 0;
    }
    else{
        timeToNextEnemy +=deltaTime;

    }
    enemies.forEach(enemy => {
        enemy.draw(ctx);
        enemy.update(deltaTime);
    })
    enemies = enemies.filter(enemy=> !enemy.markedForDeletion)
}
function restartGame() {
    player.restart()
    background.restart()
    enemies=[];
    score = 0;
    gameOver = false;
    animate(0)
}
function displayStatusText(context) {
    context.font = '40px Helvetica';
    context.fillStyle = 'black';
    context.fillText('Score: '+score , 30 , 70);
    context.fillStyle = 'white';
    context.fillText('Score: '+score , 33 , 73);
    if (gameOver) {
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText('GAME OVER, try again!', CANVAS_WIDTH/2 , 200);
        context.fillStyle = 'white';
        context.fillText('GAME OVER, try again!', CANVAS_WIDTH/2+3 , 203);
    }
}
function toggleFullScreen() {
    console.log(document.fullscreenElement);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err =>{
            alert(`Error, ///// ${err.message}`)
        })
    } else {
        document.exitFullscreen();
    }
    
}
fullScreenButton.addEventListener('click', (e)=>{
    toggleFullScreen()
})

const input = new InputHandler();
const background = new Background(CANVAS_WIDTH,CANVAS_HEIGHT);
const player = new Player(CANVAS_WIDTH,CANVAS_HEIGHT);
let lastTime = 0;


function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    background.draw(ctx)
    background.update()
    player.draw(ctx)
    player.update(input,deltaTime,enemies)
    handleEnemies(deltaTime)
    displayStatusText(ctx);
    if (!gameOver) {
        requestAnimationFrame(animate)
    }
}
animate(0)
})

