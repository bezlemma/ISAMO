<template>
  <div class="pt-8 pb-16 px-6 max-w-5xl mx-auto">
    <h1 class="text-4xl md:text-5xl font-bold mb-10">{{ content.title }}</h1>
    <PageEditor page-id="about" />
    <section id="mission" class="overflow-hidden bg-white rounded-2xl border border-slate-200 scroll-mt-8">
      <img
        :src="baseURL + 'images/zebra-finch-flock.webp'"
        alt="Watercolour of zebra finches gathering on a branch, with more finches coming in to land."
        width="1600" height="640" class="block w-full h-auto"
      />
      <div class="p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-5">{{ content.missionTitle }}</h2>
        <p class="text-lg leading-8 text-neutral-700 whitespace-pre-line">{{ content.mission }}</p>
      </div>
    </section>
  </div>
</template>
<script setup>
const { content } = useSitePage('about');
const { baseURL } = useRuntimeConfig().app;
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
