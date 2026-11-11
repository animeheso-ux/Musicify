import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPERBASE_SECRET_KEY
);

export default supabase