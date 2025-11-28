<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Scientific Resources</h1>

    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- GEISHA -->
      <a href="http://geisha.arizona.edu/geisha/" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
        <div class="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
          <span class="text-2xl group-hover:grayscale grayscale-0">🧬</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">GEISHA</h3>
        <p class="text-slate-600 mb-4">Gallus Expression in Situ Hybridization Analysis. A comprehensive database of gene expression in the chicken embryo.</p>
        <span class="text-blue-600 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- ChickyBase -->
      <a href="https://bezlemma.github.io/ChickyBase/" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
        <div class="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
          <span class="text-2xl">🐣</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-emerald-600 transition-colors">ChickyBase</h3>
        <p class="text-slate-600 mb-4">A modern gene atlas for the chicken model system, featuring interactive expression data and resources.</p>
        <span class="text-emerald-600 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- NCBI Chicken Genome -->
      <a href="https://www.ncbi.nlm.nih.gov/genome/111" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
        <div class="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors">
          <span class="text-2xl">🧬</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-amber-600 transition-colors">NCBI Genome</h3>
        <p class="text-slate-600 mb-4">The reference genome sequence and annotation for Gallus gallus domesticus.</p>
        <span class="text-amber-600 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- FarmGTEx Chicken -->
      <a href="https://chicken.farmgtex.org/" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
        <div class="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
          <span class="text-2xl">🐓</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-purple-600 transition-colors">FarmGTEx Chicken</h3>
        <p class="text-slate-600 mb-4">A comprehensive catalogue of genetic variants (GTEx) in chicken, supporting functional genomics research.</p>
        <span class="text-purple-600 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Roslin Institute (NARF) -->
      <a href="https://www.ed.ac.uk/roslin/national-avian-research-facility" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-red-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10">
        <div class="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
          <span class="text-2xl">🔬</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-red-600 transition-colors">Roslin Institute (NARF)</h3>
        <p class="text-slate-600 mb-4">The National Avian Research Facility provides resources and expertise for avian biology, including transgenic lines.</p>
        <span class="text-red-600 font-semibold text-sm flex items-center">
          Visit Facility <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Nagoya University ABRC -->
      <a href="https://www.agr.nagoya-u.ac.jp/~abrc/abrc-E/" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
        <div class="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
          <span class="text-2xl">🇯🇵</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">Nagoya Univ. ABRC</h3>
        <p class="text-slate-600 mb-4">Avian Bioscience Research Center. Home of the National BioResource Project (NBRP) Chicken/Quail in Japan.</p>
        <span class="text-indigo-600 font-semibold text-sm flex items-center">
          Visit Center <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Transgenic Quail Resources -->
      <a href="https://www.monash.edu/discovery-institute/research/infrastructure/monash-transgenic-quail-facility" target="_blank" class="group block bg-white border border-slate-200 rounded-2xl p-8 hover:border-teal-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10">
        <div class="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
          <span class="text-2xl">🐦</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-slate-900 group-hover:text-teal-600 transition-colors">Transgenic Quail</h3>
        <p class="text-slate-600 mb-4">Resources for transgenic quail models, including the Monash Transgenic Quail Facility and other global initiatives.</p>
        <span class="text-teal-600 font-semibold text-sm flex items-center">
          Visit Facility <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>
    </div>
  </div>
</template>
