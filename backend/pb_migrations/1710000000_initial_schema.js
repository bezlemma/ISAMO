migrate((db) => {
    const dao = new Dao(db);

    // 1. Create "events" collection
    const eventsCollection = new Collection({
        name: "events",
        type: "base",
        schema: [
            {
                name: "title",
                type: "text",
                required: true,
                options: { min: 1, max: 255 },
            },
            {
                name: "date",
                type: "date",
                required: true,
                options: {},
            },
            {
                name: "description",
                type: "editor", // Rich text
                required: false,
                options: {},
            },
            {
                name: "link",
                type: "url",
                required: false,
                options: {},
            },
            {
                name: "image",
                type: "file",
                required: false,
                options: {
                    maxSelect: 1,
                    maxSize: 5242880, // 5MB
                    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
                },
            },
        ],
        listRule: "", // Publicly readable
        viewRule: "", // Publicly readable
        createRule: null, // Admin only
        updateRule: null, // Admin only
        deleteRule: null, // Admin only
    });

    dao.saveCollection(eventsCollection);

    // 2. Update "users" collection (add membership fields)
    const usersCollection = dao.findCollectionByNameOrId("users");

    usersCollection.schema.addField(new SchemaField({
        name: "subscription_status",
        type: "select",
        options: {
            maxSelect: 1,
            values: ["active", "inactive", "past_due"],
        },
    }));

    usersCollection.schema.addField(new SchemaField({
        name: "stripe_customer_id",
        type: "text",
        options: {},
    }));

    dao.saveCollection(usersCollection);

}, (db) => {
    // Revert operations
    const dao = new Dao(db);

    try {
        const events = dao.findCollectionByNameOrId("events");
        dao.deleteCollection(events);
    } catch (_) { }

    // We don't revert user fields to avoid data loss on rollback in dev
});
