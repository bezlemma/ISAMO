<template>
  <div class="pt-24 pb-16 px-6 max-w-5xl mx-auto">
    <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-10">{{ content.title }}</h1>
    <PageEditor page-id="about" />
    <section id="mission" class="bg-white p-8 rounded-2xl border border-slate-200 mb-8 scroll-mt-24">
      <h2 class="text-2xl font-bold mb-5">{{ content.missionTitle }}</h2>
      <p class="text-lg leading-8 text-neutral-700 whitespace-pre-line">{{ content.mission }}</p>
    </section>
    <div class="grid grid-cols-3 gap-2 sm:gap-5" aria-label="Avian embryo microscopy">
      <figure v-for="embryo in embryos" :key="embryo.file" class="overflow-hidden rounded-2xl bg-black">
        <img :src="baseURL + 'images/' + embryo.file" :alt="embryo.alt" class="w-full h-64 sm:h-96 object-contain" loading="lazy" decoding="async" />
      </figure>
    </div>
  </div>
</template>
<script setup>
const { content } = useSitePage('about');
const { baseURL } = useRuntimeConfig().app;
const embryos = [
  { file: 'embryo-hh7.png', alt: 'Fluorescence microscopy of an avian embryo at stage HH7' },
  { file: 'embryo-7ss.png', alt: 'Fluorescence microscopy of an avian embryo at seven somites' },
  { file: 'embryo-10ss.png', alt: 'Fluorescence microscopy of an avian embryo at ten somites' }
];
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
