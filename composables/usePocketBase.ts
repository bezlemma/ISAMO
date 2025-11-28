import PocketBase from 'pocketbase';

let pbInstance: PocketBase | null = null;

export const usePocketBase = () => {
    const config = useRuntimeConfig();

    // On the client, reuse the same instance to share auth state
    if (!pbInstance) {
        pbInstance = new PocketBase(config.public.pocketbaseUrl);
    }

    return pbInstance;
};
