<template>
  <div>
    <label :for="id" class="block font-medium mb-2">{{ field.label }}<span v-if="field.optional" class="font-normal text-neutral-500"> (optional)</span></label>
    <textarea v-if="field.type === 'textarea'" :id="id" v-model="model" :required="!field.optional" :maxlength="field.max" rows="5" class="field" />
    <select v-else-if="field.type === 'select'" :id="id" v-model="model" class="field"><option v-for="option in field.options" :key="option" :value="option">{{ photoLabels[option] || option || 'No photo' }}</option></select>
    <input v-else :id="id" v-model="model" :type="field.type" :required="!field.optional" :maxlength="field.max" class="field" />
  </div>
</template>
<script setup>
defineProps({ field: { type: Object, required: true }, id: { type: String, required: true } });
const model = defineModel();
const photoLabels = { 'Ruth.png': 'Ruth Williams', 'Michael.png': 'Michael Piacentino', 'gunes.avif': 'Güneş Taylor', 'bezia.png': 'Bezia Lemma', 'Melanie.png': 'Melanie White' };
</script>
<style scoped>
.field { @apply w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900; }
</style>
