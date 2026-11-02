<template>
  <section id="trustees" class="bg-white py-12 scroll-mt-24">
    <div class="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{{ title }}</h2>
        <p class="mt-6 text-lg leading-8 text-slate-600">
          {{ introduction }}
        </p>
      </div>
      <ul role="list" class="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
        <li v-for="person in team" :key="person.name">
          <div class="flex items-center gap-x-6">
            <img v-if="person.avatar" :src="baseURL + person.avatar" :alt="person.name" width="128" height="128" class="h-32 w-32 shrink-0 rounded-full object-cover border border-slate-100" />
            <div v-else class="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500 border border-slate-100">
              {{ (person.name || '?').charAt(0) }}
            </div>
            <div>
              <h3 class="text-base font-semibold leading-7 tracking-tight text-neutral-900">
                <a v-if="person.website" :href="person.website" target="_blank" rel="noopener noreferrer" class="hover:text-red-800 transition-colors">
                  {{ person.name }}
                </a>
                <span v-else>{{ person.name || 'Unknown' }}</span>
              </h3>
              <p class="text-sm font-semibold text-red-800">{{ person.role }}</p>
              <p class="text-sm text-neutral-600">{{ person.institution }}</p>
              <a v-if="person.email" :href="'mailto:' + person.email" class="text-sm text-neutral-500 hover:text-neutral-900 block mt-1">
                {{ person.email }}
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
defineProps({ team: { type: Array, required: true }, title: { type: String, required: true }, introduction: { type: String, required: true } });
const { baseURL } = useRuntimeConfig().app;
</script>
