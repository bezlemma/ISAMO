<template>
  <div v-if="ready && member?.is_admin" class="mb-8">
    <div v-if="!editing" class="flex items-center gap-4"><button @click="begin" :disabled="busy" class="text-red-800 font-semibold underline disabled:opacity-50">{{ busy ? 'Opening editor…' : 'Edit page' }}</button><span v-if="notice" role="status" class="text-neutral-600">{{ notice }}</span></div>
    <form v-else @submit.prevent="publish" class="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-8 space-y-6">
      <h2 class="text-2xl font-bold">Edit {{ definition.label }}</h2>
      <template v-for="field in definition.fields" :key="field.key">
        <fieldset v-if="field.type === 'list'" class="space-y-4">
          <legend class="text-xl font-semibold mb-4">{{ field.label }}</legend>
          <details v-for="(item, index) in draft[field.key]" :key="field.key + '-' + index" :open="field.fixed || item._expanded" class="border border-neutral-200 rounded-xl p-4">
            <summary class="font-semibold cursor-pointer">{{ item.name || 'New ' + field.singular }}</summary>
            <div class="space-y-4 mt-4">
              <PageEditorField v-for="child in field.fields.filter(child => child.key !== 'id')" :key="child.key" v-model="item[child.key]" :field="child" :id="pageId + '-' + field.key + '-' + index + '-' + child.key" />
              <div v-if="!field.fixed" class="flex flex-wrap gap-5"><button type="button" :disabled="index === 0" @click="move(field.key,index,-1)" class="text-red-800 underline disabled:opacity-40">Move up</button><button type="button" :disabled="index === draft[field.key].length - 1" @click="move(field.key,index,1)" class="text-red-800 underline disabled:opacity-40">Move down</button><button type="button" @click="draft[field.key].splice(index,1)" class="text-red-800 underline">Remove</button></div>
            </div>
          </details>
          <button v-if="!field.fixed" type="button" :disabled="draft[field.key].length >= field.max" @click="add(field)" class="text-red-800 font-semibold underline disabled:opacity-40">Add {{ field.singular }}</button>
        </fieldset>
        <PageEditorField v-else v-model="draft[field.key]" :field="field" :id="pageId + '-' + field.key" />
      </template>
      <p v-if="error" role="alert" class="text-red-800">{{ error }}</p>
      <div class="flex gap-5 items-center"><button :disabled="busy" class="bg-red-800 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50">{{ busy ? 'Saving…' : 'Save changes' }}</button><button type="button" :disabled="busy" @click="cancel" class="text-neutral-700 underline">Cancel</button></div>
    </form>
    <p v-if="!editing && (error || loadError)" role="alert" class="text-red-800 mt-3">{{ error || loadError }}</p>
  </div>
</template>
<script setup>
import { pageDefinitions, validatePage } from '~/shared/site-pages.mjs';
const props = defineProps({ pageId: { type: String, required: true } });
const definition = pageDefinitions[props.pageId];
const { member, ready } = useCommunity();
const { content, revision, loadError, refresh, save } = useSitePage(props.pageId);
const editing = ref(false), busy = ref(false), draft = ref({}), error = ref(''), notice = ref('');
let expectedRevision = 0, original = '';
async function begin() {
  busy.value = true; error.value = ''; notice.value = '';
  try { await refresh(); draft.value = JSON.parse(JSON.stringify(content.value)); expectedRevision = revision.value; original = JSON.stringify(draft.value); editing.value = true; }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
function add(field) { draft.value[field.key].push({ ...Object.fromEntries(field.fields.map(child => [child.key, ''])), _expanded: true }); }
function move(key, index, direction) { const rows = draft.value[key]; rows.splice(index + direction, 0, rows.splice(index, 1)[0]); }
async function cancel() { editing.value = false; error.value = ''; try { await refresh(); } catch {} }
async function publish() {
  busy.value = true; error.value = '';
  try { await save(validatePage(props.pageId, draft.value), expectedRevision); editing.value = false; notice.value = 'Changes saved.'; }
  catch (e) { error.value = e.message; } finally { busy.value = false; }
}
onBeforeRouteLeave(() => !editing.value || JSON.stringify(draft.value) === original || window.confirm('Discard your unsaved page changes?'));
</script>
