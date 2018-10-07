<template>
    <div class="go" v-on:click="change">
        <div class="point" v-bind:class="random[m_type]">

        </div>
    </div>
</template>

<script>
    export default {
        props: ["type"],
        data() {
            return {
                m_type:0,
                random:['','black','white','black-hover','white-hover']
            }
        },
        watch:{
            "type":function(new_value,old_value){
                this.m_type = new_value;
            }
        },
        methods: {
            change: function(){
                if(this.m_type>2){
                    this.m_type -= 2;
                    this.$emit('click',this.m_type);
                }
            }
        },
        mounted: function(){
            this.m_type = this.type;
        }
    }
</script>

<style lang="scss">
    .go{
        width: 23px;
        height: 23px;
        display: inline-block;
        padding: 5px;
        &:hover{
            .white-hover{
                background-color: white;
                box-shadow: 0 2px 4px #333;
            }
            .black-hover{
                background-color: black;
                box-shadow: 0 2px 4px #333;
            }
        }
        .point{
            width: 23px;
            height: 23px;
            border-radius: 50%;

            @keyframes bounce-in {
                0% {
                    transform: scale(1)
                }
                33%{
                    transform: scale(1.2)
                }
                66%{
                    transform: scale(0.8)
                }
                100%{
                    transform: scale(1)
                }
            }

            &.white{
                background-color: white;
                box-shadow: 0 2px 4px #333;
                animation: bounce-in 0.6s;

            }
            &.black{
                background-color: black;
                box-shadow: 0 2px 4px #333;
                animation: bounce-in 0.6s;
            }
        }
    }
</style>