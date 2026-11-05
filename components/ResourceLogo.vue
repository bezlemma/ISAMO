<template>
  <div class="resource-logo mb-6 flex h-24 items-center justify-start rounded-lg" :class="logo?.dark ? 'bg-slate-800 px-5' : ''" aria-hidden="true">
    <img v-if="logo?.file && !failed" :src="baseURL + 'logos/' + logo.file" alt="" class="max-h-20 max-w-full object-contain" loading="lazy" decoding="async" @error="failed = true" />
    <span v-else-if="host === 'gallusa.com'" class="text-3xl font-bold tracking-tight text-slate-900">Gall<span class="text-[#41a7ff]">USA</span></span>
    <span v-else-if="host === 'chickybase.com'" class="text-3xl font-extrabold tracking-tight text-slate-900">ChickyBase</span>
    <span v-else class="text-2xl font-bold leading-tight" :class="logo?.dark ? 'text-white' : 'text-slate-800'">{{ logo?.label || resource.name }}</span>
  </div>
</template>

<script setup>
const props = defineProps({ resource: { type: Object, required: true } });
const { baseURL } = useRuntimeConfig().app;
const failed = ref(false);
const host = computed(() => {
  try { return new URL(props.resource.url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
});
const logos = {
  'geisha.arizona.edu': { file: 'geisha.gif' },
  'ngdc.cncb.ac.cn': { file: 'chickengtex.png' },
  'singlecell.broadinstitute.org': { file: 'single-cell-portal.png', dark: true },
  'ncbi.nlm.nih.gov': { file: 'ncbi.svg', dark: true },
  'ensembl.org': { file: 'ensembl.svg' },
  'hgdownload.soe.ucsc.edu': { file: 'ucsc.png' },
  'birdgenenames.org': { file: 'cgnc.png' },
  'data.faang.org': { file: 'faang.png' },
  'vet.ed.ac.uk': { file: 'roslin.webp' },
  'pubmed.ncbi.nlm.nih.gov': { file: 'pubmed.svg' },
  'europepmc.org': { file: 'europe-pmc.jpg' },
  'agr.nagoya-u.ac.jp': { file: 'nagoya.svg' },
  'animalscience.ucdavis.edu': { file: 'uc-davis.svg' },
  'pirbright.ac.uk': { file: 'pirbright.svg' },
  'quail.anatomyportal.org': { label: 'Quail Anatomy Portal' },
  'gallusresources.org': { label: 'Gallus Genetic Resource Center' }
};
const logo = computed(() => logos[host.value]);
watch(() => props.resource.url, () => { failed.value = false; });
</script>
