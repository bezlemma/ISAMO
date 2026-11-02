<template>
  <div class="pt-24 pb-16 px-6 max-w-5xl mx-auto">
    <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-10">{{ content.title }}</h1>
    <PageEditor page-id="about" />
    <section id="mission" class="bg-white p-8 rounded-2xl border border-slate-200 mb-8 scroll-mt-24">
      <h2 class="text-2xl font-bold mb-5">{{ content.missionTitle }}</h2>
      <p class="text-lg leading-8 text-neutral-700 whitespace-pre-line">{{ content.mission }}</p>
    </section>
  </div>
</template>
<script setup>
const { content } = useSitePage('about');
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
