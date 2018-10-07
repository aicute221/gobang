<template>
    <div class="game">
        <div class="win" v-if="win_status === 1">
            <p class="win_p">
                You win
                <span v-on:click="rewStart">再战一局</span>
            </p>
        </div>
        <div class="lose" v-if="win_status === 2">
            <p class="lose_p">
                You lose
                <span v-on:click="rewStart">再战一局</span>
            </p>
        </div>
        <div class="container">
            <div class="left-right">
                <span v-for="num in nums" >{{num}}</span>
            </div>
            <div class="two">
                <div class="top-down">
                    <span v-for="num in nums" >{{num}}</span>
                </div>
                <table>
                    <tr v-for="row in lines">
                        <td v-for="col in row"></td>
                    </tr>
                </table>
            </div>
            <div class="points">
                <div v-for="row,i in points">
                    <go v-bind:type="col" v-for="col,j in row" v-on:click="goClick(i,j,$event)"></go>
                </div>
            </div>
            <div class="info-panel">
                <div class="info-top">
                    <span>房间号</span>
                    <span>{{room_id}}</span>
                    <p>
                        <span>当前:</span>
                        <go v-bind:type="color"></go>
                    </p>
                    <p>
                        <span>战绩:</span>
                        <span>{{win_count}} / {{total_count}}</span>
                    </p>
                </div>

                <div class="info-bottom">
                    <p v-for="mess in messages">{{mess}}</p>
                </div>
            </div>
        </div>
        <div class="cover" v-show="show_cover">
        </div>
        <div class="enter" v-show="show_cover">
            <button @click="createRoom">创建房间</button>
            <input type="number" v-model="room_id" placeholder="请输入房间号" v-on:keyup.enter="joinRoom">
            <button @click="joinRoom">加入房间</button>
        </div>
    </div>
</template>

<script>
    const host = "api.congnannan.com";
    
    import Go from "./Go.vue"
    export default {
        components:{
            go: Go
        },
        data() {
            return {
                lines: [],
                nums:[],
                points:[],
                socket: null,
                show_cover: true,
                room_id: "",
                color: 1,
                current_color:1,
                win_status: 0,
                win_count:0,
                total_count:0,
                messages:[],



            }
        },
        methods: {
            back: function(){
                this.$router.push("index")
            },

            initLines: function(){
                for(var i = 0;i < 14;i ++){
                    var p = [];
                    for(var j = 0; j < 14;j ++){
                        p.push(j);
                    }
                    this.lines.push(p);
                }

                for(var i = 1;i<16;i++){
                    this.nums.push(i)
                }

                this.initPoints();
            },

            initPoints: function(){
                var ps = [];
                for(var i = 0;i<15;i++){
                    var r = [];
                    for(var j = 0;j<15;j++){
                        r.push(0);
                    }
                    ps.push(r);
                }
                this.points = ps;
            },

            goClick: function(i,j,e){
//                console.log("aaaa",i,j,e);
                this.socket.send(JSON.stringify({
                    "option": "step",
                    "i": i,
                    "j": j,
                    "color": e,
                }))
            },

            rewStart: function(){
                this.socket.send(JSON.stringify({
                    "option":"renew"
                }))
            },

            // 处理message
            handleMessage: function(e){
                var message = JSON.parse(e.data);
                console.log(message);
                switch(message.option){
                    case "join" :
                        this.whenJoin(message);
                        break;

                    case "new" :
                        this.whenNewGame(message);
                        break;


                    case "step":
                        this.whenStep(message);
                        break;

                    case "win":
                        this.win_status = 1;
                        this.win_count++;
                        this.total_count++;
                        this.finish();
                        break;

                    case "lose":
                        this.win_status = 2;
                        this.total_count++;
                        this.finish();
                        break;
                }

            },

            // 加入对局成功
            whenJoin(data){
                this.room_id = data.room_id;
                this.show_cover = false;

                // 请求新开局
                this.new_game();
                this.messages.push("开始对局")
            },

            //处理颜色
            whenNextTurn(){
//                var turn_color = 0;
//                if(this.current_color === this.color){
//                    turn_color = this.color + 2;
//                }
                for(var i = 0;i<15;i++){
                    for(var j=0;j<15;j++){
                        if(this.points[i][j] !== 1 && this.points[i][j] !== 2){
                            if(this.current_color === this.color){
                                this.$set(this.points[i],j,this.color+2);
                            }else{
                                this.$set(this.points[i],j,0);
                            }
                        }
                    }
                }
            },

            finish(){
                this.current_color = 3- this.color;
                this.whenNextTurn();
            },

            whenNewGame(data){
                this.win_status = 0;

                this.color = data.color;
                this.current_color = data.current_color;
                this.initPoints();

                this.whenNextTurn();
            },

            whenStep(data){
                this.$set(this.points[data.i],data.j,data.color);
                this.current_color = data.current_color;

                var arr = ["黑","白"];

                if(this.current_color === this.color){
                    this.messages.push("对方："+arr[data.color-1]+"("+(data.i+1)+"."+(data.j+1)+")");
                }else{
                    this.messages.push("己方："+arr[data.color-1]+"("+(data.i+1)+"."+(data.j+1)+")");
                }


                this.whenNextTurn();
            },


            connent: function(){
                var url = "ws://"+host+"/game";
                this.socket = new WebSocket(url);
                this.socket.onopen = function(e){
                    console.log(e);
                };
                this.socket.onmessage = this.handleMessage;
                this.socket.onclose = function(e){
                    console.log(e);
                };
                this.socket.onerror = function(e){
                    console.log(e);
                }
            },

            // 请求创建房间，并获取 room_id;
            createRoom(){
                axios.post("http://"+host+"/new_room")
                    .then(res => {
                        var data = res.data;
                        this.room_id = data.room_id;
                        console.log(this.room_id);
                        this.joinRoom()
                    })
                    .catch(function(error){
                        console.error(error)
                    })
            },

            // 发送加入房间事件
            joinRoom(){
                this.socket.send(JSON.stringify({
                    'option':'join',
                    'room_id': this.room_id,
                }))
            },

            new_game(){
                this.socket.send(JSON.stringify({
                    'option':'new',
                }))
            }




        },
        mounted: function(){
            this.initLines();
            this.connent();
        },
        watch: {
            messages: function(){
                setTimeout(function(){
                    var el = document.getElementsByClassName("info-bottom")[0];
                    el.scrollTop = el.scrollHeight;
                },100)
            }
        }
    }
</script>

<style lang="scss">
    .game{
        position: relative;
        .win,.lose{
            position: absolute;
            top: -67px;
            left: 41%;
            p{
                display: inline-block;
                padding: 6px;
                font-size: 18px;
                width: 260px;
                &.win_p{
                    color: green;
                    border: solid 1px green;
                }
                &.lose_p{
                    color: grey;
                    border: solid 1px grey;
                }
                span{
                    display: inline-block;
                    padding: 0 10px 0 10px;
                    color: green;
                    font-size: 14px;
                    cursor: pointer;
                }
            }
        }
        .container{
            background: url(../assets/mu.jpg);
            border: solid 3px rgb(177,152,118);
            width: 555px;
            height: 550px;
            margin: 60px auto;
            position: relative;
            .left-right{
                margin: 0 auto 0 auto;
                span{
                    display: inline-block;
                    width: 33px;
                    height: 30px;
                    user-select: none;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 200;
                    padding-top: 20px;
                }
            }
            .two{
                margin: -10px auto 0 -30px;
                table{
                    border-collapse: collapse;
                    display: inline-block;
                    td{
                        border: solid 1px #fff;
                        width: 30px;
                        height: 30px;
                    }
                }
                .top-down{
                    display: inline-block;
                    margin-right: 10px;
                    span{
                        display: block;
                        width: 30px;
                        height: 33px;
                        user-select: none;
                        color: #fff;
                        font-size: 13px;
                        font-weight: 200;
                    }
                }
            }
            .points{
                position: absolute;
                top: 35px;
                left: 35px;
                >div{
                    height: 33px;
                }
            }
            .info-panel{
                position: absolute;
                right: -160px;
                top: -3px;
                color: #fff;
                width: 140px;
                text-align: left;

                >div{
                    background-color: rgb(177, 152, 118);
                    padding: 10px 0 10px 10px;
                }

                .info-top{
                    >span{
                        display: inline-block;
                        margin-bottom: 10px;
                    }

                    >p{
                        margin: 0;
                        span {
                            display: inline-block;
                            vertical-align: top;
                            padding: 6px 5px 0 0;
                        }
                    }
                }

                .info-bottom{
                    margin-top: 20px;
                    height: 395px;
                    padding-top: 10px;
                    overflow-y: scroll;
                    p{
                        margin: 0;
                        font-size: 13px;
                        color: #eee;
                        font-weight: 500;
                        padding-top: 3px;
                    }
                }
            }
        }
        .cover{
            z-index: 10;
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            background-color: rgba(0,0,0,0.6)
        }
        .enter{
            z-index: 20;
            position: fixed;
            top: 30%;
            left: 40%;
            margin: 0 auto;
            button,input{
                display: block;
                background-color: #fff;
                color: #666;
                width: 300px;
                padding: 8px 0;
                margin-bottom: 20px;
                outline: none;
                border: none;
            }
            button{
                cursor: pointer;
            }
            input{
                text-align: center;
            }
        }
    }
</style>
