import PocketBase from 'pocketbase';

const pb = new PocketBase('https://isamo.pockethost.io/');

// Hardcoded credentials for convenience
const EMAIL = "bezia.lemma@gmail.com";
const PASSWORD = "chickydoo12";

(async () => {
    try {
        console.log("🌱 ISAMO Remote Data Seeder");
        console.log("--------------------------");
        console.log("This script will populate your Pockethost instance with initial data.");
        console.log("Target: https://isamo.pockethost.io/");
        console.log("");

        console.log("\nAuthenticating...");
        await pb.admins.authWithPassword(EMAIL, PASSWORD);
        console.log("✅ Authenticated!");

        // 0. Repair Events Schema (PocketBase v0.23+ uses 'fields')
        console.log("\nRepairing Events Schema...");
        try {
            const collection = await pb.collections.getOne('events');

            // Define fields for v0.23+
            const newFields = [
                { name: "id", type: "text" },
                { name: "created", type: "autodate" },
                { name: "updated", type: "autodate" },
                { name: "title", type: "text", required: true },
                { name: "date", type: "date", required: true },
                { name: "description", type: "editor" },
                { name: "link", type: "url" },
                {
                    name: "image",
                    type: "file",
                    options: {
                        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
                        maxSelect: 1
                    }
                }
            ];

            // Try updating with 'fields'
            await pb.collections.update(collection.id, {
                fields: newFields
            });
            console.log("✅ Events schema/fields updated successfully.");
        } catch (e) {
            console.log("⚠️  Failed to update schema:", e.message);
        }

        // 0.5 Verify Schema
        try {
            const collection = await pb.collections.getOne('events');
            const fields = collection.fields || collection.schema; // Handle both versions
            if (fields) {
                console.log("Current Events Fields:", fields.map(f => f.name).join(', '));
            } else {
                console.log("⚠️  Could not find 'fields' or 'schema' property on collection.");
                console.log("Collection keys:", Object.keys(collection).join(', '));
            }
        } catch (e) {
            console.log("Could not fetch events collection:", e.message);
        }

        // 1. Seed Events
        console.log("\nCreating Events...");
        const eventsToSeed = [
            {
                title: "XIII Avian Model Systems Meeting",
                date: "2027-07-01 09:00:00.000Z",
                description: "<p>Join us in Nagoya, Japan for the 13th International Avian Model Systems Meeting. This premier event brings together researchers from around the globe to discuss the latest advancements in avian biology.</p>",
                link: "https://www.google.com/search?q=XIII+Avian+Model+Systems+Meeting+Nagoya+2027"
            },
            {
                title: "ISAMO Meeting #2",
                date: "2025-12-04 10:00:00.000Z",
                description: "<p>Join us at way too early in the morning, and hope that daylight savings didn't screw this meeting up</p>",
                link: ""
            }
        ];

        for (const event of eventsToSeed) {
            try {
                // Fix date format
                const cleanDate = event.date.replace(' ', 'T');

                const payload = {
                    title: event.title,
                    date: cleanDate,
                    description: event.description,
                };
                if (event.link && event.link.trim() !== "") payload.link = event.link;
                if (event.image) payload.image = event.image;

                console.log(`Checking if event "${event.title}" exists...`);

                // Use getList instead of getFirstListItem
                const existing = await pb.collection('events').getList(1, 1, {
                    filter: `title="${event.title}"`
                });

                if (existing.items.length > 0) {
                    console.log(`ℹ️  Event "${event.title}" already exists.`);
                } else {
                    console.log(`Creating event with payload:`, JSON.stringify(payload, null, 2));
                    await pb.collection('events').create(payload);
                    console.log(`✅ Created event: ${event.title}`);
                }
            } catch (e) {
                console.log(`❌ Failed to process event ${event.title}:`, e.message);
                if (e.data) console.log("Error details:", JSON.stringify(e.data, null, 2));
            }
        }

        // 1.5 Repair Users Schema
        console.log("\nRepairing Users Schema...");
        try {
            // Fetch fresh collection to get current fields
            const collection = await pb.collections.getOne('users');

            const existingNames = new Set(collection.fields.map(f => f.name));

            const fieldsToAdd = [
                { name: "name", type: "text" },
                { name: "avatar", type: "file", options: { mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"], maxSelect: 1 } },
                { name: "role", type: "text" },
                { name: "institution", type: "text" },
                { name: "website", type: "url" },
                { name: "priority", type: "number" },
                // Membership Fields
                { name: "stripe_customer_id", type: "text" },
                { name: "membership_type", type: "select", options: { values: ["student", "regular"], maxSelect: 1 } },
                { name: "membership_expiry", type: "date" }
            ];

            const newFields = [...collection.fields];
            let addedCount = 0;

            for (const f of fieldsToAdd) {
                if (!existingNames.has(f.name)) {
                    newFields.push(f);
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                console.log(`Adding ${addedCount} new fields...`);
                await pb.collections.update(collection.id, {
                    fields: newFields,
                    listRule: "", // Public list
                    viewRule: ""  // Public view
                });
                console.log("✅ Users schema updated successfully.");
            } else {
                console.log("ℹ️  No new fields to add.");
            }
        } catch (e) {
            console.log("⚠️  Failed to update users schema:", e.message);
            if (e.data) console.log(JSON.stringify(e.data, null, 2));
        }

        // 2. Seed Users
        console.log("\nCreating/Updating Users...");

        // Helper to get file blob
        const getFile = async (path) => {
            try {
                const fs = await import('fs');
                return new File([fs.readFileSync(path)], path.split('/').pop());
            } catch (e) { return null; }
        };

        const usersToSeed = [
            {
                email: "Ruth.williams@manchester.ac.uk", name: "Ruth Williams",
                role: "Chair", institution: "University of Manchester", priority: 1,
                subscription_status: "active"
            },
            {
                email: "michaelpiacentino@jhmi.edu", name: "Mike Piacentino",
                role: "Secretary", institution: "Johns Hopkins Medicine", priority: 2,
                subscription_status: "active"
            },
            {
                email: "gunes.taylor@ed.ac.uk", name: "Gunes Taylor",
                role: "Treasurer", institution: "University of Edinburgh", website: "https://www.gunestaylor.com", priority: 3,
                subscription_status: "active",
                imagePath: "public/gunes.avif"
            },
            {
                email: "bezia.lemma@gmail.com", name: "Bezia Lemma",
                role: "Vice Chair – Membership", institution: "Princeton University", website: "https://bezialemma.com/", priority: 4,
                subscription_status: "active",
                imagePath: "public/bezia.png"
            },
            {
                email: "melanie.white@imb.uq.edu.au", name: "Mel White",
                role: "Vice Chair – Communications", institution: "University of Queensland", priority: 5,
                subscription_status: "active",
                imagePath: "public/mel.jpeg"
            },
        ];

        for (const u of usersToSeed) {
            try {
                const payload = { ...u };
                delete payload.imagePath; // Don't send path as string

                // Prepare image if available
                if (u.imagePath) {
                    const file = await getFile(u.imagePath);
                    if (file) payload.avatar = file;
                }
                payload.password = "12345678";
                payload.passwordConfirm = "12345678";

                try {
                    const existing = await pb.collection('users').getFirstListItem(`email="${u.email}"`);
                    console.log(`Updating user ${u.name}...`);
                    await pb.collection('users').update(existing.id, payload);
                    console.log(`✅ Updated user: ${u.name}`);
                } catch (err) {
                    if (err.status === 404) {
                        await pb.collection('users').create(payload);
                        console.log(`✅ Created user: ${u.name}`);
                    } else {
                        throw err;
                    }
                }
            } catch (e) {
                console.log(`❌ Failed to process user ${u.name}:`, e.message);
            }
        }

        // 3. Debug Users
        console.log("\nDebugging Users...");
        try {
            const collection = await pb.collections.getOne('users');
            console.log("Users Collection Fields:", collection.fields.map(f => f.name).join(', '));

            const ruth = await pb.collection('users').getFirstListItem('email="Ruth.williams@manchester.ac.uk"');
            console.log("Ruth Record (Admin View):", JSON.stringify(ruth, null, 2));
        } catch (e) {
            console.log("Debug failed:", e.message);
        }

        console.log("\n🎉 Seeding complete!");
        process.exit(0);

    } catch (e) {
        console.error("\n❌ Error occurred:", e.message);
        process.exit(1);
    }
})();
