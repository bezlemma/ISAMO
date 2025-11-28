import PocketBase from 'pocketbase';

const pb = new PocketBase('https://isamo.pockethost.io/');

const EMAIL = "bezia.lemma@gmail.com";
const PASSWORD = "12345678";

(async () => {
    try {
        console.log("Checking user role...");
        await pb.collection('users').authWithPassword(EMAIL, PASSWORD);

        const user = pb.authStore.model;
        console.log("User ID:", user.id);
        console.log("User Email:", user.email);
        console.log("User Role:", user.role);
        console.log("Full Record:", JSON.stringify(user, null, 2));

        if (!user.role) {
            console.log("\n⚠️  User has NO role. This is why the Admin Stats link is hidden.");
        } else {
            console.log("\n✅ User has role:", user.role);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
})();
