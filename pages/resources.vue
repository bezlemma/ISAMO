<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Scientific Resources</h1>

    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- GEISHA -->
      <a href="http://geisha.arizona.edu/geisha/" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">GEISHA</h3>
        <p class="text-neutral-600 mb-4">Gallus Expression in Situ Hybridization Analysis. A comprehensive database of gene expression in the chicken embryo.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- ChickyBase -->
      <a href="https://bezlemma.github.io/ChickyBase/" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">ChickyBase</h3>
        <p class="text-neutral-600 mb-4">A modern gene atlas for the chicken model system, featuring interactive expression data and resources.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- NCBI Chicken Genome -->
      <a href="https://www.ncbi.nlm.nih.gov/genome/111" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">NCBI Genome</h3>
        <p class="text-neutral-600 mb-4">The reference genome sequence and annotation for Gallus gallus domesticus.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- FarmGTEx Chicken -->
      <a href="https://chicken.farmgtex.org/" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">FarmGTEx Chicken</h3>
        <p class="text-neutral-600 mb-4">A comprehensive catalogue of genetic variants (GTEx) in chicken, supporting functional genomics research.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Database <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Roslin Institute (NARF) -->
      <a href="https://www.ed.ac.uk/roslin/national-avian-research-facility" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <div class="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors">
          <span class="text-2xl">🇬🇧</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">Roslin Institute (NARF)</h3>
        <p class="text-neutral-600 mb-4">The National Avian Research Facility provides resources and expertise for avian biology, including transgenic lines.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Facility <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Nagoya University ABRC -->
      <a href="https://www.agr.nagoya-u.ac.jp/~abrc/abrc-E/" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <div class="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors">
          <span class="text-2xl">🇯🇵</span>
        </div>
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">Nagoya Univ. ABRC</h3>
        <p class="text-neutral-600 mb-4">Avian Bioscience Research Center. Home of the National BioResource Project (NBRP) Chicken/Quail in Japan.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Center <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>

      <!-- Quail Anatomy Portal -->
      <a href="https://quail.anatomyportal.org/" target="_blank" class="group block bg-white border border-neutral-200 rounded-2xl p-8 hover:border-red-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
        <h3 class="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-red-800 transition-colors">Quail Anatomy Portal</h3>
        <p class="text-neutral-600 mb-4">A 3D interactive atlas of quail anatomy, providing detailed visualizations for research and education.</p>
        <span class="text-red-800 font-semibold text-sm flex items-center">
          Visit Portal <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </span>
      </a>


    </div>
  </div>
</template>
