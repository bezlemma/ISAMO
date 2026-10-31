<template>
  <article class="pt-24 pb-16 px-6 max-w-4xl mx-auto">
    <NuxtLink to="/about#constitution" class="text-red-800 underline">Back to What is ISAMO</NuxtLink>
    <h1 class="text-4xl font-bold mt-8 mb-4">Draft constitution</h1>
    <p class="text-neutral-600 mb-8">Version dated 4 December 2025. Membership fees and terms in this draft are under revision.</p>
    <div class="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10">
      <template v-for="(paragraph, index) in paragraphs" :key="index"><h2 v-if="paragraph.heading" class="text-2xl font-bold mt-8 mb-4">{{ paragraph.text }}</h2><p v-else class="leading-7 text-neutral-700 mb-4 whitespace-pre-wrap">{{ paragraph.text }}</p></template>
    </div>
  </article>
</template>
<script setup>
import paragraphs from '~/data/constitution.json';
useHead({ title: 'Draft constitution | ISAMO' });
</script>
