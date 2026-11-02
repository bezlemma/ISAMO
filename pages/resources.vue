<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Scientific Resources</h1>
    </div>
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <a v-for="resource in resources" :key="resource.url" :href="resource.url" target="_blank" rel="noopener noreferrer" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <div v-if="resource.name.startsWith('Roslin') || resource.name.startsWith('Nagoya')" class="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors" aria-hidden="true">
          <span class="text-2xl">{{ resource.name.startsWith('Roslin') ? '🇬🇧' : '🇯🇵' }}</span>
        </div>
        <h2 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">{{ resource.name }}</h2>
        <p class="text-neutral-600 mb-4">{{ resource.description }}</p>
        <span class="text-red-800 font-semibold text-sm">
          {{ resource.category === 'Research facilities' ? 'Visit Facility' : 'Visit Resource' }}
        </span>
      </a>
    </div>
  </div>
</template>
<script setup>
import resources from '~/data/chicken-resources.json';
useHead({ title: 'Scientific Resources | ISAMO' });
</script>
