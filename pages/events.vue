<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Upcoming Events</h1>

    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-red-400">
      <p>Failed to load events. Please try again later.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
      <p class="text-slate-600 text-lg">No upcoming events scheduled.</p>
      <p class="text-slate-500 text-sm mt-2">Check back soon for updates.</p>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="event in events" :key="event.id" 
           class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
        
        <!-- Event Image -->
        <div class="aspect-video bg-slate-100 relative overflow-hidden">
          <img v-if="event.image" 
               :src="pb.files.getURL(event, event.image)" 
               :alt="event.title"
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <span class="text-4xl">📅</span>
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-center text-sm text-neutral-500 mb-4">
            <svg class="mr-1.5 h-5 w-5 text-red-800" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5" />
            </svg>
            {{ new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>
          
          <h3 class="text-xl font-bold text-neutral-900 group-hover:text-red-800 transition-colors mb-2">
            {{ event.title }}
          </h3>
          
          <div class="prose prose-sm prose-neutral mb-4 line-clamp-3" v-html="event.description"></div>
          
          <a v-if="event.link" :href="event.link" target="_blank" class="inline-flex items-center text-sm font-semibold text-red-800 hover:text-red-700">
            Learn more <span aria-hidden="true" class="ml-1">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const pb = usePocketBase();

// Fetch events from PocketBase
const { data: events, pending, error } = await useAsyncData('events', async () => {
  const records = await pb.collection('events').getList(1, 50, {
    sort: '+date',
    filter: 'date >= "' + new Date().toISOString() + '"' // Only future events
  });
  return records.items;
});
</script>
