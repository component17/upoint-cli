<template>
    <div class="my-component">
        <div class="logo">
            <img src="./img/logo_dark.svg">
        </div>

        <div class="info">
            <div class="title">Поздавляем! Плагин работает.</div>
        </div>

        <div class="links">
            <ul>
                <li>
                    <u-btn @click="openRemote('http://upoint.store/')">Документация разработчика</u-btn>
                </li>
                <li>
                    <u-btn @click="openRemote('http://upoint.store/')">Быстрый старт</u-btn>
                </li>
                <li>
                    <u-btn @click="openRemote('https://vuejs.org/')">Vue.js</u-btn>
                </li>
                <li>
                    <u-btn @click="openRemote('http://upoint.store/')">Upoint.Store</u-btn>
                </li>

                <li>
                    <u-btn @click="openRemote('http://upoint.store/')">Публикация плагина</u-btn>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
	export default {
		name: 'newcomponent',
		data() {
			return {
				version: 1
			}
		},

		methods: {
			openRemote(url) {
				this.$electron.shell.openExternal(url);
			}
		}
	}
</script>

<style scoped>
    div.my-component {
        width:100%;
        margin:10px;
    }
    div.my-component div.info div.title {
        font-size:20px;
        font-weight: bold;
        text-align: center;
    }
    div.my-component div.links {
        text-align: center;
        margin-top:20px;
    }
    div.my-component div.links ul li {
        list-style: none;
        display: inline-block;
    }
    div.logo {
        text-align: center;
    }
    div.logo img {
        width:300px;
        margin:20px auto;
    }
</style>
