<script>
    let i = 0;
    export default {
	    /**
         * Install API function
	     * @param App
	     * @param Api
	     */
    	install(App, Api) {
    		/**
             * Now we can use <api-test/> tag in any Vue component
    		App.component('apiTest', require('./api/apiTest.vue'));
             **/
		    /**
             * Now we can use this.$api.component17.test.somemethod() or this.$api.component17.test.somevar
		     */
		   /*
		   Api.add({
                test: require('./api/test.js'),
            }, 'component17', 'http://help.link/docs');
            */
        },


        background: {
	        /**
	         * Функция для зарадения обработчика.
	         *
	         * Обратите внимание, функция обязана возвращать промис. При этом resolve должен быть вызван только после выполнения кода функции, для того, чтобы корректно работал интервал и не создавал лишней нагрузки на компьютер и сеть пользователя.
	         *
	         * @param App
	         * @returns {Promise}
	         */
	       /* func(App, data) {
	            return new Promise((resolve, reject) => {
	                App.$api.component17.test.somemethod().then(() => {
		                // после выполнения всех действий (например, проверки сервера апи)
		                // функция должна позволить запустить себя в следующий раз
		                // вызывая resolve();
	                	setTimeout(() => {
	                		i++;
	                		resolve({i})
                        })
                    })
                })
	        },*/

	        /**
	         * Интервал выполнения функции работы в фоне
	         */
	       /* interval: 10000,*/
	        /**
	         * Описание функции для пользователя.
	         */
	        /*desc: "Test background task",

	        errorHandler(error) {
		        console.log(error);
	        },

	        developerNotify: false,*/
        }
    }
</script>