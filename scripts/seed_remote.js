import PocketBase from 'pocketbase';
import readline from 'readline';

const pb = new PocketBase('https://isamo.pockethost.io/');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("🌱 ISAMO Remote Data Seeder");
console.log("--------------------------");
console.log("This script will populate your Pockethost instance with initial data.");
console.log("Target: https://isamo.pockethost.io/");
console.log("");

rl.question('Enter your Pockethost Admin Email: ', (email) => {
    rl.question('Enter your Pockethost Admin Password: ', async (password) => {
        try {
            console.log("\nAuthenticating...");
            await pb.admins.authWithPassword(email, password);
            console.log("✅ Authenticated!");

            // 1. Seed Event
            console.log("\nCreating Event...");
            try {
                await pb.collection('events').create({
                    title: "XIII Avian Model Systems Meeting",
                    date: "2027-09-15 09:00:00.000Z",
                    description: "<p>Join us in Nagoya, Japan for the 13th International Avian Model Systems Meeting. This premier event brings together researchers from around the globe to discuss the latest advancements in avian biology.</p>",
                    link: "https://www.google.com/search?q=XIII+Avian+Model+Systems+Meeting+Nagoya+2027"
                });
                console.log("✅ Created event: XIII Avian Model Systems Meeting");
            } catch (e) {
                console.log("⚠️  Event might already exist or error:", e.message);
            }

            // 2. Seed Users
            console.log("\nCreating Users...");
            const usersToSeed = [
                { email: "bez@example.com", name: "Bezia Lemma", subscription_status: "active" },
                { email: "gunes.taylor@ed.ac.uk", name: "Gunes Taylor", subscription_status: "active" },
                { email: "michaelpiacentino@jhmi.edu", name: "Mike Piacentino", subscription_status: "active" },
                { email: "melanie.white@imb.uq.edu.au", name: "Mel White", subscription_status: "active" },
                { email: "Ruth.williams@manchester.ac.uk", name: "Ruth Williams", subscription_status: "active" },
                { email: "student@example.com", name: "Alex Student", subscription_status: "active" },
                { email: "prof@example.com", name: "Prof. Avian", subscription_status: "past_due" },
            ];

            for (const u of usersToSeed) {
                try {
                    // Check if user exists first to avoid error spam
                    try {
                        await pb.collection('users').getFirstListItem(`email="${u.email}"`);
                        console.log(`ℹ️  User ${u.name} already exists.`);
                    } catch (err) {
                        if (err.status === 404) {
                            await pb.collection('users').create({
                                email: u.email,
                                password: "12345678",
                                passwordConfirm: "12345678",
                                name: u.name,
                                subscription_status: u.subscription_status
                            });
                            console.log(`✅ Created user: ${u.name}`);
                        } else {
                            throw err;
                        }
                    }
                } catch (e) {
                    console.log(`❌ Failed to create user ${u.name}:`, e.message);
                }
            }

            console.log("\n🎉 Seeding complete!");
            process.exit(0);

        } catch (e) {
            console.error("\n❌ Authentication failed or error occurred:", e.message);
            process.exit(1);
        }
    });
});
