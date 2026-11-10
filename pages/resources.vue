<template>
  <div class="pt-8 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">{{ content.title }}</h1>
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
  </div>
</template>
<script setup>
const { content } = useSitePage('resources');
useHead(() => ({ title: content.value.title + ' | ISAMO' }));
</script>
