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
          
          <!-- Date Badge -->
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1 rounded-lg text-sm font-mono text-blue-600 shadow-sm">
            {{ new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
          </div>
        </div>

        <div class="p-6">
          <h3 class="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{{ event.title }}</h3>
          <div class="prose prose-slate prose-sm mb-4 line-clamp-3" v-html="event.description"></div>
          
          <a v-if="event.link" 
             :href="event.link" 
             target="_blank"
             class="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300">
            View Details 
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
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
