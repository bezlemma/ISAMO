/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
    const dao = new Dao(db);

    // 1. Seed Event: XIII Avian Model Systems Meeting
    const eventsCollection = dao.findCollectionByNameOrId("events");

    // Check if event already exists to avoid duplicates
    try {
        const existing = dao.findFirstRecordByData("events", "title", "XIII Avian Model Systems Meeting");
    } catch (e) {
        const event = new Record(eventsCollection);
        event.set("title", "XIII Avian Model Systems Meeting");
        event.set("date", "2027-09-15 09:00:00.000Z"); // Approximate date
        event.set("description", "<p>Join us in Nagoya, Japan for the 13th International Avian Model Systems Meeting. This premier event brings together researchers from around the globe to discuss the latest advancements in avian biology.</p>");
        event.set("link", "https://www.google.com/search?q=XIII+Avian+Model+Systems+Meeting+Nagoya+2027"); // Placeholder link
        // No image for now, or could use a placeholder URL if supported by schema
        dao.saveRecord(event);
        console.log("Seeded event: XIII Avian Model Systems Meeting");
    }

    // 2. Seed Users
    const usersCollection = dao.findCollectionByNameOrId("users");
    const usersToSeed = [
        { email: "bez@example.com", name: "Bezia Lemma", subscription_status: "active" },
        { email: "gunes.taylor@ed.ac.uk", name: "Gunes Taylor", subscription_status: "active" },
        { email: "michaelpiacentino@jhmi.edu", name: "Mike Piacentino", subscription_status: "active" },
        { email: "melanie.white@imb.uq.edu.au", name: "Mel White", subscription_status: "active" },
        { email: "Ruth.williams@manchester.ac.uk", name: "Ruth Williams", subscription_status: "active" },
        // Fake users
        { email: "student@example.com", name: "Alex Student", subscription_status: "active" },
        { email: "prof@example.com", name: "Prof. Avian", subscription_status: "past_due" },
    ];

    usersToSeed.forEach((u) => {
        try {
            dao.findAuthRecordByEmail("users", u.email);
        } catch (e) {
            const user = new Record(usersCollection);
            user.setEmail(u.email);
            user.setPassword("12345678"); // Default password for seeded users
            user.setUsername(u.email.split('@')[0] + Math.floor(Math.random() * 1000)); // Generate unique username
            user.set("name", u.name);
            user.set("subscription_status", u.subscription_status);
            dao.saveRecord(user);
            console.log("Seeded user: " + u.name);
        }
    });

}, (db) => {
    // Revert migration (optional, usually leaves data)
});
