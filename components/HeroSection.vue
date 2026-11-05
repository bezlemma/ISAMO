<template>
  <div class="hero relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
    <div class="avian-models absolute inset-0 z-0 pointer-events-none" role="img" aria-label="Watercolor illustrations of a quail, chicken and zebra finch">
      <img :src="baseURL + 'images/quail.png'" alt="" class="quail" decoding="async" />
      <img :src="baseURL + 'Ruby.png'" alt="" fetchpriority="high" class="chicken" />
      <img :src="baseURL + 'images/zebra-finch.png'" alt="" class="finch" decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
      <h1 class="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-neutral-900 drop-shadow-sm">
        International Society for <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-red-800">
          Avian Model Organisms
        </span>
      </h1>

      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
        <NuxtLink to="/membership" class="px-10 py-4 bg-red-800 text-white rounded-full font-bold text-lg hover:bg-red-900 transition-all hover:-translate-y-1 shadow-xl shadow-red-900/20 border border-red-700">
          Become a Member
        </NuxtLink>
        <NuxtLink to="/events" class="px-10 py-4 bg-white text-neutral-900 border-2 border-neutral-200 rounded-full font-bold text-lg hover:border-red-800 hover:text-red-800 transition-all hover:-translate-y-1">
          View Events
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { baseURL } = useRuntimeConfig().app;
</script>

<style scoped>
.avian-models img { position: absolute; object-fit: contain; mix-blend-mode: multiply; }
.chicken { height: 85%; width: 48%; left: 26%; top: 7.5%; opacity: .8; }
.quail { width: 34%; height: 44%; left: -1%; top: 32%; opacity: .9; }
.finch { width: 32%; height: 40%; right: -1%; top: 35%; opacity: .9; }
@media (max-width: 639px) {
  .hero { min-height: max(100svh, 52rem); }
  .chicken { width: 86%; left: 7%; top: 2%; height: 70%; }
  .quail { width: 48%; left: 1%; top: 79%; height: 20%; }
  .finch { width: 48%; right: 1%; top: 79%; height: 20%; }
  .avian-models > div { opacity: .25; }
}
</style>
