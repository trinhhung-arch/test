<template>
  <div class="min-h-screen">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Footer />
    <Toast />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Toast
  }
}
</script> 