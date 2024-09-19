<script>
    import axios from 'axios';

    export default {
        data() {
            return {
                formData: {
                    username: '',
                    email: '',
                    password: '',
                    confirm_password: '',
                    nickname: '' // Aggiunto campo nickname
                },
                message: '',
                isError: false,
                showSuccessCard: false
            };
        },
        methods: {
            async register() {
                if (!this.validateData()) return;

                try {
                    const response = await axios.post('http://localhost:5000/auth/register', this.formData);
                    this.message = response.data.message || 'Registrazione completata con successo!';
                    this.isError = false;
                    this.showSuccessCard = true;

                    setTimeout(() => {
                        this.showSuccessCard = false;
                        this.$router.push('/');
                    }, 3000);
                } catch (error) {
                    if (error.response) {
                        this.message = error.response.data.error || 'Registrazione fallita';
                        this.isError = true;
                    } else if (error.request) {
                        this.message = 'Nessuna risposta ricevuta dal server';
                        this.isError = true;
                    } else {
                        this.message = 'Errore nella configurazione della richiesta';
                        this.isError = true;
                    }
                }
            },
            validateData() {
                if (this.formData.password !== this.formData.confirm_password) {
                    this.message = 'Le password non corrispondono';
                    this.isError = true;
                    return false;
                }

                if (this.formData.password.length < 10) {
                    this.message = 'La password deve contenere almeno 10 caratteri';
                    this.isError = true;
                    return false;
                }

                const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;
                if (!specialCharRegex.test(this.formData.password)) {
                    this.message = 'La password deve contenere almeno un carattere speciale';
                    this.isError = true;
                    return false;
                }

                return true;
            }
        }
    }
</script>


<template>
    <div class="w-full h-screen flex flex-col justify-center items-center">
        <h1 v-if="!showSuccessCard" class="text-3xl text-teal-600">Benvenuto in NexTalk</h1>

        <!-- Card di Successo -->
        <div v-if="showSuccessCard"
            class="flex flex-col items-center p-6 bg-green-50 border border-green-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <svg class="w-12 h-12 mb-4 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <h2 class="text-xl font-semibold text-green-800 dark:text-green-400">Successo!</h2>
            <p class="mt-2 text-green-700 dark:text-green-300">{{ message }}</p>
            <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Verrai reindirizzato tra poco...</p>
        </div>

        <!-- Alert di Errore -->
        <div v-if="isError && message"
            class="flex p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span class="sr-only">Danger</span>
            <div>
                <span class="font-medium">Errore:</span> {{ message }}
            </div>
        </div>

        <!-- Modulo di Registrazione -->
        <form v-if="!showSuccessCard" class="p-10" @submit.prevent="register">
            <div class="flex flex-col space-y-5">
                <div>
                    <label for="username"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                    <input type="text" id="username"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required v-model="formData.username" />
                </div>
                <div class="mb-6">
                    <label for="email"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input type="email" id="email"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required v-model="formData.email" />
                </div>
                <div class="mb-6">
                    <label for="password"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" id="password"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required v-model="formData.password" />
                </div>
                <div class="mb-6">
                    <label for="confirm_password"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Conferma password</label>
                    <input type="password" id="confirm_password"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required v-model="formData.confirm_password" />
                </div>
                <div class="mb-6">
                    <label for="nickname" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nickname</label>
                    <input type="text" id="nickname"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        v-model="formData.nickname" required />
                </div>

                <button type="submit"
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Registrati</button>
            </div>
        </form>
        <nuxt-link v-if="!showSuccessCard" class="text-3xl text-red-500" to="/">Home</nuxt-link>
    </div>
</template>



<style lang="scss">

</style>