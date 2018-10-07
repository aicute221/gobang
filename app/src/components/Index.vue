<template>
    <div>
        I am index
        <button v-on:click="start">点我开始</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        },
        methods: {
            start : function(){
                this.$router.push('game')
            }
        }
    }
</script>
