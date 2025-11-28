<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">About ISAMO</h1>

    </div>

    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-8 text-slate-900 border-b border-slate-200 pb-4">Leadership Team</h2>
      
      <div class="grid gap-6 md:grid-cols-2">
        <div v-for="person in team" :key="person.name" class="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500/30 transition-colors">
          <!-- Avatar / Image -->
          <div class="flex-shrink-0">
            <img v-if="person.image" :src="person.image" :alt="person.name" class="h-16 w-16 rounded-full object-cover border border-slate-100" />
            <div v-else class="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
              {{ person.name.charAt(0) }}
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              <a v-if="person.website" :href="person.website" target="_blank" class="hover:text-blue-600 transition-colors flex items-center gap-1">
                {{ person.name }}
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
              <span v-else>{{ person.name }}</span>
            </h3>
            <p class="text-sm text-blue-600 mb-1">{{ person.institution }}</p>
            <a v-if="person.email" :href="'mailto:' + person.email" class="text-sm text-slate-500 hover:text-slate-900">
              {{ person.email }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const team = [
  { name: 'Bezia Lemma', institution: 'Princeton University', email: 'bezia.lemma@gmail.com', website: 'https://bezialemma.com/', image: '/bezia.png' },
  { name: 'Gunes Taylor', institution: 'University of Edinburgh', email: 'gunes.taylor@ed.ac.uk' },
  { name: 'Mike Piacentino', institution: 'Johns Hopkins Medicine', email: 'michaelpiacentino@jhmi.edu' },
  { name: 'Mel White', institution: 'University of Queensland', email: 'melanie.white@imb.uq.edu.au' },
  { name: 'Ruth Williams', institution: 'University of Manchester', email: 'Ruth.williams@manchester.ac.uk' },
];
</script>
