<template>
  <div class="hero relative flex items-center justify-center overflow-hidden bg-white">
    <div ref="birds" class="avian-models absolute inset-0 z-0 pointer-events-none" :class="{ 'is-ready': imagesReady, 'is-paused': paused }" role="img" aria-label="Watercolor illustrations of a quail, chicken, zebra finch, pigeon and emu">
      <img :src="baseURL + 'images/quail.png'" alt="" class="quail" decoding="async" />
      <img :src="baseURL + 'Ruby.png'" alt="" fetchpriority="high" class="chicken" />
      <img :src="baseURL + 'images/zebra-finch.png'" alt="" class="finch" decoding="async" />
      <img :src="baseURL + 'images/pigeon.png'" alt="" class="pigeon" decoding="async" />
      <img :src="baseURL + 'images/emu.png'" alt="" class="emu" decoding="async" />
      <div class="bird-fade absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
    </div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
      <h1 class="text-[2.8125rem] max-[374px]:text-[1.96875rem] md:text-7xl leading-none font-bold tracking-tight mb-8 drop-shadow-sm">
        International Society for <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-highlight to-brand-deep">
          Avian Model Organisms
        </span>
      </h1>

      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
        <NuxtLink to="/membership" class="px-10 py-4 bg-brand-fill text-brand-on-fill rounded-full font-bold text-lg hover:bg-brand-hover transition-all hover:-translate-y-1 shadow-xl shadow-brand-deep/20 border border-brand">
          Become a Member
        </NuxtLink>
        <NuxtLink to="/events" class="px-10 py-4 bg-white text-neutral-900 border-2 border-neutral-200 rounded-full font-bold text-lg hover:border-brand hover:text-brand transition-all hover:-translate-y-1">
          View Events
        </NuxtLink>
      </div>
    </div>
    <button
      v-if="imagesReady"
      type="button"
      class="motion-toggle absolute bottom-5 left-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-600 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      :aria-label="paused ? 'Resume bird animation' : 'Pause bird animation'"
      :title="paused ? 'Resume bird animation' : 'Pause bird animation'"
      @click="paused = !paused"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
        <path v-if="paused" d="M7 4v16l13-8z" />
        <path v-else d="M6 4h4v16H6zm8 0h4v16h-4z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const { baseURL } = useRuntimeConfig().app;
const birds = ref(null);
const imagesReady = ref(false);
const paused = ref(false);
let unmounted = false;

onMounted(async () => {
  // Start together after the images load, including images already in the cache.
  await Promise.all(Array.from(birds.value.querySelectorAll('img'), image => image.decode().catch(() => {})));
  if (!unmounted) imagesReady.value = true;
});
onBeforeUnmount(() => { unmounted = true; });
</script>

<style scoped>
.hero { min-height: calc(100svh - var(--header-height) - 1px); }
.avian-models img { position: absolute; object-fit: contain; mix-blend-mode: multiply; }
.chicken { height: 85%; width: 48%; left: 26%; top: 7.5%; opacity: .8; z-index: 3; }
.quail { width: 34%; height: 44%; left: -1%; top: 32%; opacity: .9; z-index: 2; }
.finch { width: 32%; height: 40%; left: 69%; top: 35%; opacity: .9; z-index: 2; }
.pigeon { width: 22%; height: 30%; left: 61%; top: 3%; opacity: .55; z-index: 1; }
.emu { width: 22%; height: 30%; left: 17%; top: 3%; opacity: .55; z-index: 1; }
.avian-models {
  --centre-width: 48%; --centre-height: 85%; --centre-left: 26%; --centre-top: 7.5%;
  --left-width: 34%; --left-height: 44%; --left-x: -1%; --left-top: 32%;
  --right-width: 32%; --right-height: 40%; --right-x: 69%; --right-top: 35%;
  --rear-width: 22%; --rear-height: 30%; --rear-left-x: 17%; --rear-right-x: 61%; --rear-top: 3%;
}
.bird-fade { z-index: 4; }
.motion-toggle { display: none; }

@media (prefers-reduced-motion: no-preference) {
  .avian-models.is-ready img { animation: bird-orbit 120s ease-in-out infinite; }
  .avian-models.is-ready .quail { animation-delay: -96s; }
  .avian-models.is-ready .finch { animation-delay: -24s; }
  .avian-models.is-ready .pigeon { animation-delay: -48s; }
  .avian-models.is-ready .emu { animation-delay: -72s; }
  .avian-models.is-paused img { animation-play-state: paused; }
  .motion-toggle { display: flex; }
}

/* Each bird spends the same time at centre stage. The return path passes behind. */
@keyframes bird-orbit {
  0%, 5%, 100% {
    width: var(--centre-width); height: var(--centre-height);
    left: var(--centre-left); top: var(--centre-top); opacity: .8; z-index: 3;
  }
  20%, 25% {
    width: var(--right-width); height: var(--right-height);
    left: var(--right-x); top: var(--right-top); opacity: .9; z-index: 2;
  }
  40%, 45% {
    width: var(--rear-width); height: var(--rear-height);
    left: var(--rear-right-x); top: var(--rear-top); opacity: .55; z-index: 1;
  }
  60%, 65% {
    width: var(--rear-width); height: var(--rear-height);
    left: var(--rear-left-x); top: var(--rear-top); opacity: .55; z-index: 1;
  }
  80%, 85% {
    width: var(--left-width); height: var(--left-height);
    left: var(--left-x); top: var(--left-top); opacity: .9; z-index: 2;
  }
}

@media (max-width: 639px) {
  .hero { min-height: calc(max(100svh, 52rem) - var(--header-height) - 1px); }
  .chicken { width: 86%; left: 7%; top: 2%; height: 70%; }
  .quail { width: 48%; left: 1%; top: 79%; height: 20%; }
  .finch { width: 48%; left: 51%; top: 79%; height: 20%; }
  .pigeon { width: 30%; left: 65%; top: 64%; height: 15%; }
  .emu { width: 30%; left: 5%; top: 64%; height: 15%; }
  .avian-models {
    --centre-width: 86%; --centre-height: 70%; --centre-left: 7%; --centre-top: 2%;
    --left-width: 48%; --left-height: 20%; --left-x: 1%; --left-top: 79%;
    --right-width: 48%; --right-height: 20%; --right-x: 51%; --right-top: 79%;
    --rear-width: 30%; --rear-height: 15%; --rear-left-x: 5%; --rear-right-x: 65%; --rear-top: 64%;
  }
  .bird-fade { opacity: .25; }
  .motion-toggle { bottom: .25rem; left: .25rem; }
}
</style>
