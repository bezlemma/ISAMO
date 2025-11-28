import PocketBase from 'pocketbase';

const pb = new PocketBase('https://isamo.pockethost.io/');
const EMAIL = "bezia.lemma@gmail.com";
const PASSWORD = "chickydoo12";

(async () => {
    try {
        console.log("Authenticating...");
        await pb.admins.authWithPassword(EMAIL, PASSWORD);

        console.log("Fetching Users Collection...");
        const collection = await pb.collections.getOne('users');
        console.log("Current Fields:", collection.fields.map(f => f.name).join(', '));

        // Try adding JUST one field to see if it works
        console.log("Attempting to add 'stripe_customer_id'...");

        const newField = { name: "stripe_customer_id", type: "text" };

        // Check if it already exists
        if (collection.fields.find(f => f.name === newField.name)) {
            console.log("Field already exists!");
        } else {
            const newFields = [...collection.fields, newField];
            await pb.collections.update(collection.id, { fields: newFields });
            console.log("✅ Success! Field added.");
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.data) console.error(JSON.stringify(e.data, null, 2));
    }
})();
