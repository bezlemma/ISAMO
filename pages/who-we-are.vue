<template>
  <div class="pt-24 pb-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-8"><h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-10">{{ content.title }}</h1><PageEditor page-id="who-we-are" /><nav aria-label="People and contact" class="flex flex-wrap gap-6 text-brand font-semibold mb-4"><a href="#trustees">{{ content.trusteesTitle }}</a><a href="#advisory-board">{{ content.boardTitle }}</a><a href="#contact">{{ content.contactTitle }}</a></nav></div>
    <CommitteeDirectory :team="content.trustees" :title="content.trusteesTitle" :introduction="content.trusteesDescription" />
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <section id="advisory-board" class="py-12 border-b border-neutral-200 scroll-mt-24">
        <h2 class="text-3xl font-bold mb-6">{{ content.boardTitle }}</h2>
        <p class="text-neutral-600 mb-6 whitespace-pre-line">{{ content.boardDescription }}</p>
        <div v-for="person in content.board" :key="person.name" class="mb-5">
          <h3 class="font-semibold text-lg"><a v-if="person.website" :href="person.website" target="_blank" rel="noopener noreferrer" class="text-brand underline underline-offset-4 hover:text-brand-deep">{{ person.name }}</a><span v-else>{{ person.name }}</span></h3>
          <p class="text-neutral-600">{{ person.institution }}</p>
        </div>
      </section>
      <section id="contact" class="pt-12 scroll-mt-24 grid gap-8 md:grid-cols-2 items-center">
        <div><h2 class="text-3xl font-bold mb-5">{{ content.contactTitle }}</h2><p class="text-neutral-600 mb-4 whitespace-pre-line">{{ content.contactDescription }}</p><a :href="'mailto:' + content.email" class="text-lg text-brand font-semibold underline">{{ content.email }}</a></div>
        <img :src="baseURL + 'images/feather.jpeg'" alt="A close-up of the branching structure of a feather" class="w-full h-72 sm:h-80 rounded-2xl object-cover" loading="lazy" decoding="async" />
      </section>
    </div>
  </div>
</template>
<script setup>
const { content } = useSitePage('who-we-are');
const { baseURL } = useRuntimeConfig().app;
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
