import { supabase } from "./supabase";

export async function getOrCreateUser() {
    const { data: { user }} = await supabase.auth.getUser();

    if(user) return user;

    const { data: { user: newUser }, error } = await supabase.auth.signInAnonymously();

    if(error || !newUser) {
        throw new Error("Failed to authenticate");
    }

    return newUser;
}