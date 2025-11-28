import PocketBase from 'pocketbase';

const pb = new PocketBase('https://isamo.pockethost.io/');
const EMAIL = "bezia.lemma@gmail.com";
const PASSWORD = "chickydoo12";

(async () => {
    try {
        console.log("Authenticating...");
        await pb.admins.authWithPassword(EMAIL, PASSWORD);

        console.log("Fetching Users Collection...");
        let collection = await pb.collections.getOne('users');

        // 1. Add membership_expiry
        if (!collection.fields.find(f => f.name === 'membership_expiry')) {
            console.log("Adding 'membership_expiry'...");
            const newFields = [...collection.fields, { name: "membership_expiry", type: "date" }];
            await pb.collections.update(collection.id, { fields: newFields });
            console.log("✅ Added 'membership_expiry'");

            // Refresh collection
            collection = await pb.collections.getOne('users');
        } else {
            console.log("ℹ️ 'membership_expiry' already exists.");
        }

        // 2. Add membership_type
        if (!collection.fields.find(f => f.name === 'membership_type')) {
            console.log("Adding 'membership_type'...");
            const newFields = [...collection.fields, {
                name: "membership_type",
                type: "text"
            }];
            await pb.collections.update(collection.id, { fields: newFields });
            console.log("✅ Added 'membership_type'");
        } else {
            console.log("ℹ️ 'membership_type' already exists.");
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.data) console.error(JSON.stringify(e.data, null, 2));
    }
})();
