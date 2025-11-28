<template>
  <div class="pt-24 pb-12 px-4 max-w-7xl mx-auto">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p class="text-neutral-600">Membership statistics and revenue overview.</p>
      </div>
      <button @click="refreshStats" class="text-sm text-red-800 hover:text-red-700 font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Total Members -->
      <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <p class="text-sm font-medium text-neutral-500 mb-1">Total Members</p>
        <p class="text-3xl font-bold text-neutral-900">{{ stats.totalMembers }}</p>
      </div>

      <!-- Student Members -->
      <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <p class="text-sm font-medium text-neutral-500 mb-1">Student Members</p>
        <p class="text-3xl font-bold text-neutral-900">{{ stats.studentMembers }}</p>
        <p class="text-xs text-neutral-400 mt-2">$25/yr</p>
      </div>

      <!-- Regular Members -->
      <div class="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <p class="text-sm font-medium text-neutral-500 mb-1">Regular Members</p>
        <p class="text-3xl font-bold text-neutral-900">{{ stats.regularMembers }}</p>
        <p class="text-xs text-neutral-400 mt-2">$100/yr</p>
      </div>

      <!-- Estimated Revenue -->
      <div class="bg-white p-6 rounded-2xl border border-red-100 shadow-sm bg-gradient-to-br from-white to-red-50">
        <p class="text-sm font-medium text-red-800 mb-1">Est. Annual Revenue</p>
        <p class="text-3xl font-bold text-red-900">${{ stats.estimatedRevenue.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <a href="https://isamo.pockethost.io/_/" target="_blank" class="flex items-center p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-red-200 hover:shadow-md transition-all group">
        <div class="p-3 bg-neutral-100 rounded-xl group-hover:bg-red-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-neutral-600 group-hover:text-red-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="font-bold text-neutral-900 group-hover:text-red-800 transition-colors">PocketBase Admin</h3>
          <p class="text-sm text-neutral-500">Manage content, users, and events.</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-auto text-neutral-400 group-hover:text-red-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>

      <a href="https://dashboard.stripe.com/" target="_blank" class="flex items-center p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-red-200 hover:shadow-md transition-all group">
        <div class="p-3 bg-neutral-100 rounded-xl group-hover:bg-red-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-neutral-600 group-hover:text-red-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="font-bold text-neutral-900 group-hover:text-red-800 transition-colors">Stripe Dashboard</h3>
          <p class="text-sm text-neutral-500">View payments, refunds, and payouts.</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-auto text-neutral-400 group-hover:text-red-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>

    <!-- Recent Signups Table (Optional but helpful) -->
    <div class="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <h3 class="font-semibold text-neutral-900">Recent Members</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-neutral-500 uppercase bg-neutral-50">
            <tr>
              <th class="px-6 py-3">Name / Email</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in recentMembers" :key="member.id" class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
              <td class="px-6 py-4 font-medium text-neutral-900">
                {{ member.name || 'No Name' }}
                <div class="text-xs text-neutral-500 font-normal">{{ member.email }}</div>
              </td>
              <td class="px-6 py-4 capitalize">{{ member.membership_type || '-' }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  member.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                ]">
                  {{ member.subscription_status || 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-neutral-500">
                {{ new Date(member.created).toLocaleDateString() }}
              </td>
            </tr>
            <tr v-if="recentMembers.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-neutral-500">No members found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const pb = usePocketBase();
const stats = ref({
  totalMembers: 0,
  studentMembers: 0,
  regularMembers: 0,
  estimatedRevenue: 0
});
const recentMembers = ref([]);

const refreshStats = async () => {
  // Security check
  if (!pb.authStore.isValid || !pb.authStore.model?.role) {
    navigateTo('/');
    return;
  }

  try {
    // Fetch all users (for stats)
    // Note: For a very large app, you'd want to use server-side aggregation or paginated counts.
    // For now, fetching full list is fine for < 1000 members.
    const allUsers = await pb.collection('users').getFullList({
      sort: '-created',
    });

    let studentCount = 0;
    let regularCount = 0;
    let revenue = 0;

    allUsers.forEach(u => {
      // Logic: Check membership_type. 
      // If missing, maybe infer or just count as 'Unknown' (not added to revenue).
      // We only count 'active' subscriptions for revenue ideally, but let's show potential revenue for now
      // or just count everyone who has a type.
      
      // Let's count everyone with a type for "Estimated Annual Revenue" assuming they pay.
      // Or strictly check subscription_status === 'active'. 
      // Let's be optimistic but clear it's "Estimated".
      
      if (u.membership_type === 'student') {
        studentCount++;
        revenue += 25;
      } else if (u.membership_type === 'regular') {
        regularCount++;
        revenue += 100;
      }
    });

    stats.value = {
      totalMembers: allUsers.length,
      studentMembers: studentCount,
      regularMembers: regularCount,
      estimatedRevenue: revenue
    };

    // Top 10 recent
    recentMembers.value = allUsers.slice(0, 10);

  } catch (e) {
    console.error("Failed to fetch stats:", e);
  }
};

onMounted(() => {
  refreshStats();
});
</script>
