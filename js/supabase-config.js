// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================

const SUPABASE_URL = 'https://juqfzavsndbumxktwxdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cWZ6YXZzbmRidW14a3R3eGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDQ4NjQsImV4cCI6MjA4NTEyMDg2NH0.1TBoQif8xCS3NgjQcBJ_zvglrNE4199fDgRHFCFCTYU';

// ============================================
// SENHA DO ADMIN (mude para uma senha sua)
// ============================================

const ADMIN_PASSWORD = 'passos2024';

// ============================================
// CLIENTE SUPABASE
// ============================================

let supabaseClient = null;
let supabaseLoaded = false;

// Função para inicializar o Supabase
function initSupabase() {
    return new Promise((resolve) => {
        if (supabaseClient) {
            resolve(supabaseClient);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = function() {
            try {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                supabaseLoaded = true;
                console.log('✅ Supabase conectado com sucesso!');
                resolve(supabaseClient);
            } catch (error) {
                console.error('❌ Erro ao conectar Supabase:', error);
                resolve(null);
            }
        };
        script.onerror = function() {
            console.error('❌ Erro ao carregar script do Supabase');
            resolve(null);
        };
        document.head.appendChild(script);
    });
}

// Função para aguardar o Supabase carregar
async function waitForSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    // Esperar até 5 segundos
    for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 100));
        if (supabaseClient) {
            return supabaseClient;
        }
    }
    
    // Tentar inicializar novamente
    return await initSupabase();
}

// Inicializar automaticamente
initSupabase();
