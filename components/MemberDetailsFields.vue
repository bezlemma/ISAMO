<template>
  <div class="space-y-4">
    <div><label :for="prefix + '-institution'" class="block font-medium mb-1">Institution</label><input :id="prefix + '-institution'" v-model="model.institution" required maxlength="200" autocomplete="organization" class="field" /><p class="text-sm text-neutral-500 mt-1">If unaffiliated, enter “Independent researcher”.</p></div>
    <div><label :for="prefix + '-role'" class="block font-medium mb-1">Role</label><input :id="prefix + '-role'" v-model="model.role" required maxlength="100" list="research-roles" class="field" /><datalist id="research-roles"><option>Student</option><option>Postdoctoral researcher</option><option>Technical staff</option><option>Group leader</option><option>Research staff</option><option>Retired</option><option>Independent researcher</option></datalist></div>
    <div><label :for="prefix + '-research'" class="block font-medium mb-1">Brief description of your research</label><textarea :id="prefix + '-research'" v-model="model.research" required maxlength="2000" rows="3" class="field" /></div>
    <label class="flex items-start gap-3 cursor-pointer"><input v-model="model.mailing_list" type="checkbox" class="mt-1 h-5 w-5 accent-red-800 flex-shrink-0" /><span>Email me ISAMO news and event updates.<span class="block text-sm text-neutral-500 mt-1">Uncheck to opt out. You can change this preference at any time.</span></span></label>
  </div>
</template>
<script setup>
defineProps({ prefix: { type: String, required: true } });
const model = defineModel({ required: true });
</script>
<style scoped>
.field { @apply w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900; }
</style>
