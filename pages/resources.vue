<template>
  <div class="pt-8 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ content.title }}</h1>
    </div>
    <PageEditor page-id="resources" />
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <a v-for="resource in content.resources" :key="resource.url" :href="resource.url" target="_blank" rel="noopener noreferrer" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-brand-line transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-deep/5">
        <ResourceLogo :resource="resource" />
        <h2 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-brand transition-colors">{{ resource.name }}</h2>
        <p class="text-neutral-600 mb-4">{{ resource.description }}</p>
        <span class="text-brand font-semibold text-sm">
          {{ resource.category === 'Research facilities' ? 'Visit Facility' : 'Visit Resource' }}
        </span>
      </a>
    </div>
    <section id="embryo-microscopy" aria-labelledby="microscopy-title" class="mt-14 scroll-mt-8">
      <h2 id="microscopy-title" class="text-2xl font-bold text-brand">Gene expression in avian embryos</h2>
      <p class="mt-2 text-neutral-700">Hybridization chain reaction (HCR) shows FezF2 (purple), Otx2 (green) and TFAP2a (red) at three stages.</p>
      <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
        <figure v-for="embryo in embryos" :key="embryo.file" class="min-w-0">
          <a :href="baseURL + 'images/' + embryo.file" class="block rounded-xl">
            <img :src="baseURL + 'images/' + embryo.file" :alt="'View full-size avian embryo at ' + embryo.stage"
                 class="aspect-[3/5] max-h-96 w-full rounded-xl bg-black object-contain" loading="lazy" decoding="async" />
          </a>
          <figcaption class="mt-2 text-center font-medium">{{ embryo.stage }}</figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>
<script setup>
const { content } = useSitePage('resources');
const { baseURL } = useRuntimeConfig().app;
const embryos = [
  { file: 'embryo-hh7.png', stage: 'HH7' },
  { file: 'embryo-7ss.png', stage: '7 somites' },
  { file: 'embryo-10ss.png', stage: '10 somites' }
];
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
