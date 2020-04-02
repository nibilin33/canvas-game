<template>
    <div class="game" id="app">
        <canvas id="games" width="800" height="500"></canvas>
        <br/>
        <audio src="/video/mp3cut1.mp3" preload id="music" hidden>
        </audio>
        <button class="play-button" v-if="isGameOver" @click="drawImage">开始</button>
        <button class="play-button" v-else @click="stop">结束</button>
        <button class="play-button" @click="muteAudio">{{isMute?'播放':'静音'}}</button>
        <button class="play-button" @click="showScore">记录排行</button>
        <el-dialog
        title="记录排行"
        :visible.sync="dialogVisible"
        width="50%"> 
        <div class="top-number">TOP 10</div>
        <div class="table-limit-height">
        <table>   
        <tr v-for="(it,index) in scopeList" :key="index">
            <td class="username">
                <span class="range-number">{{index+1}}</span>
                <el-avatar size="small" :src="it.avater">{{it.userId}}</el-avatar>
                <span class="user-line">{{it.userId}}</span>
                <img src="/jianpai.png" v-if="index === 0"/>
            </td>
            <td class="userscore">{{it.score}}分</td>
        </tr>
        </table>
        </div>
        <span slot="footer" class="dialog-footer">
            <button class="close-button" @click="dialogVisible = false">关闭</button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
import Bird from './fly';
import Background from './background';
import Gun from './bullet';
import Music from './mp3';
import {isMobile} from './utils';
import { Dialog,Avatar } from 'element-ui';
import 'element-ui/lib/theme-chalk/dialog.css';
import 'element-ui/lib/theme-chalk/avatar.css';
import {
    getList,
    addScore
} from './db';
function getQueryString(key) {
   var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
   var r = window.location.search.substr(1).match(reg);
   if (r != null) return r[2];
   return null;
}
export default {
    components:{
        [Dialog.name]:Dialog,
        [Avatar.name]:Avatar
    },
    data() {
        return {
            dialogVisible:false,
            bird:null,
            bg:null,
            gun:null,
            timeout:null,
            isGameOver:true,
            isMute:false,
            scopeList:[],
            currentUser: {
                nickName: 'default',
            }
        }
    },
    async mounted() {
        await this.init();
        if(window.__wxjs_environment === 'miniprogram') {
            this.currentUser = JSON.parse(decodeURI(getQueryString('userInfo')));
        }
    },
    methods:{
        async showScore() {
            this.dialogVisible = true;
            this.scopeList = await getList();
        },
        muteAudio() {
            Music[Music.status]();
            this.isMute = Music.status == 'play';
        },
        async init() {
            /** @type {HTMLCanvasElement} */
            const canvas = document.getElementById('games');
            const context = canvas.getContext('2d');
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight - 58;
            this.bird = new Bird(context);
            this.bg = new Background(context,canvas.width,canvas.height);
            await this.bg.draw();
            await this.bird.draw();
            Music.init();
            this.fillText('按住屏幕角色上移，松开角色下移','20px');
            this.gun = new Gun(context);
            this.addEvent(canvas);
        },
        addEvent(canvas) {
            let downEvent = '',upEvent='';
            if(isMobile) {
                downEvent = 'touchstart';
                upEvent = 'touchend';
            }else {
                downEvent = 'mousedown';
                upEvent = 'mouseup';
            }
            canvas.addEventListener(downEvent,()=>{
                this.bird.up();
            });
            canvas.addEventListener(upEvent,()=>{
               this.bird.down();
            });
        },
        fillText(txt,fontSize='30px') {
            const canvas = document.getElementById('games');
            const ctx = canvas.getContext('2d');
            ctx.font = `${fontSize} Comic Sans MS`;
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText(txt, canvas.width/2, canvas.height/2);
        },
        gameOver(){
            this.fillText('Game Over!');
            this.isGameOver = true;
            Music.pause();
        },
        clear() {
            const canvas = document.getElementById('games');
            const context = canvas.getContext('2d');
            context.clearRect(0,0,canvas.width,canvas.height);
        },
        stop() {
            this.gameOver();
            clearTimeout(this.timeout);
            this.bird.stopMove();
            this.gun.stopFire();
            this.bg.stopMove();
        },
        async refresh() {
            this.clear();
            await this.bg.draw();
            await this.bird.draw();
            this.gun.refresh(this.bird,this.bg.xtotal);
            if(!this.bird.stop||!this.gun.stop) {
                addScore(this.bg.xtotal,this.currentUser.nickName,this.currentUser.avatarUrl);
                this.gameOver();
                this.stop();
                return;
            }
            this.timeout = setTimeout(()=>{
                this.refresh();
            },1000/60);
        },
        drawImage() {
            if(this.isGameOver) {
                const canvas = document.getElementById('games');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0,0,canvas.width,canvas.height);
            }
            if(!this.isMute) {
                Music.play();
            }
            this.isGameOver = false;
            this.bird.init();
            this.bg.move();
            this.bird.move();
            this.gun.fire();
            this.refresh();
        }
    }
}
</script>
<style lang="scss">
body,html{
    height: 100%;
    margin:0;
}
.el-dialog__body,.el-dialog__header{
    padding:5px 20px;
}

.game{
    height: 100%;
    -webkit-overflow-scrolling:touch;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
    text-align: center;
    .table-limit-height{
        max-height: 40vh;
        overflow-y:auto;
    }
    .top-number{
        font-weight:bold;
        color: transparent;
        -webkit-text-stroke: 1px #F56C6C;
    }
    .range-number{
        font-weight:bold;
        color: transparent;
        line-height: 28px;
        vertical-align: top;
        -webkit-text-stroke: 1px #606266;
        padding-right: 5px;
    }
    .user-line{
        line-height: 28px;
        vertical-align: top;
        padding-left:5px;
        margin-right: 5px;
    }
    .username {
        color:#606266;
    }
    .userscore{
        color:#F56C6C;
    }
    table{
        width: 100%;
        td{
            padding: 12px 0;
            min-width: 0;
            box-sizing: border-box;
            text-overflow: ellipsis;
            vertical-align: middle;
            position: relative;
            text-align: left;
            border-bottom: 1px solid #ebeef5;
        }
    }
    button{
        background: 0 0;
        background-image: none;
        outline: 0;
        border: 0;
        cursor: pointer;
        padding: 0;
    }
    .close-button{
        display: inline-block;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        background: #fff;
        border: 1px solid #dcdfe6;
        color: #606266;
        -webkit-appearance: none;
        text-align: center;
        box-sizing: border-box;
        outline: none;
        margin: 0;
        transition: .1s;
        font-weight: 500;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        padding: 10px 10px;
        font-size: 14px;
        border-radius: 4px;
    }
    .play-button {
        width: 100px;
        height: 45px;
        line-height: 45px;
        border-radius: 30px;
        background-color: rgba(0,0,0,.6);
        position: relative;
        transition: background-color .2s;
        color:#fff;
        &:hover{
            background-color: rgba(0,0,0,.5);
        }
    }
}

</style>