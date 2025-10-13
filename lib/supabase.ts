import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jhjcdrubaimalifkxdor.supabase.co"
const supabasePublishableKey = "sb_publishable_MlPiL87plw4SPOhKI4BqzA_6_MEJNEO"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})