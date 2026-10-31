<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Events</h1>

    </div>

    <div class="grid gap-8 md:grid-cols-3 mb-16">
      <section v-for="series in seriesList" :id="series.id" :key="series.id" class="bg-white border border-slate-200 rounded-2xl p-8 scroll-mt-24">
        <h2 class="text-2xl font-bold mb-4">{{ series.name }}</h2><p class="text-neutral-600 leading-7 mb-6">{{ series.description }}</p><a :href="series.url" target="_blank" rel="noopener noreferrer" class="text-red-800 font-semibold underline">{{ series.linkLabel }} ↗</a>
      </section>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8"><h2 class="text-2xl font-bold">Community event announcements</h2><div><label for="event-filter" class="sr-only">Filter events</label><select id="event-filter" v-model="selectedSeries" class="border border-neutral-200 bg-white rounded-lg px-4 py-3"><option value="">All events</option><option v-for="series in seriesList" :key="series.id" :value="series.id">{{ series.name }}</option><option value="other">Other events</option></select></div></div>
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-red-400">
      <p>{{ error }}</p>
      <button @click="load" class="mt-4 text-red-800 font-semibold underline">Try again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredEvents.length" class="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
      <p class="text-slate-600 text-lg">No upcoming community announcements{{ selectedSeries ? ' in this series' : '' }}.</p>
      <NuxtLink to="/community" class="inline-block text-red-800 font-semibold underline mt-3">Share an event</NuxtLink>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="event in filteredEvents" :key="event.id"
           class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">

        <!-- Event Image -->
        <div class="aspect-video bg-slate-100 relative overflow-hidden">
          <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <span class="text-4xl">📅</span>
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-center text-sm text-neutral-500 mb-4">
            <svg class="mr-1.5 h-5 w-5 text-red-800" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5" />
            </svg>
            {{ new Date(event.event_date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>

          <h3 class="text-xl font-bold text-neutral-900 group-hover:text-red-800 transition-colors mb-2">
            {{ event.title }}
          </h3>

          <p class="text-neutral-600 whitespace-pre-wrap mb-4">{{ event.body }}</p>

          <a v-if="event.link" :href="event.link" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm font-semibold text-red-800 hover:text-red-700">
            Learn more <span aria-hidden="true" class="ml-1">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import seriesList from '~/data/event-series.json';
const { api } = useCommunity();
const events = ref([]), pending = ref(true), error = ref('');
const selectedSeries = ref('');
const filteredEvents = computed(() => selectedSeries.value ? events.value.filter(event => event.event_series === selectedSeries.value) : events.value);
async function load() { pending.value = true; error.value = ''; try { events.value = (await api('/posts?kind=event')).posts; } catch (e) { error.value = e.message; } finally { pending.value = false; } }
onMounted(load);
</script>
