// ============================================
// FORMULÁRIO DE CANDIDATURA - PASSOS DO SABER
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initForm();
});

function initForm() {
    const form = document.getElementById('candidaturaForm');
    const vagaRadios = document.querySelectorAll('input[name="vaga"]');
    const camposProfessor = document.getElementById('campos-professor');
    const camposVendedor = document.getElementById('campos-vendedor');
    const telefoneInput = document.getElementById('telefone');

    // Mostrar/ocultar campos específicos baseado na vaga selecionada
    vagaRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            camposProfessor.classList.add('hidden');
            camposVendedor.classList.add('hidden');

            if (this.value === 'professor') {
                camposProfessor.classList.remove('hidden');
            } else if (this.value === 'vendedor') {
                camposVendedor.classList.remove('hidden');
            }
        });
    });

    // Máscara para telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/^(\d{0,2})/, '($1');
            } else if (value.length <= 7) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    });

    // Submissão do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar campos obrigatórios específicos
        const vagaSelecionada = document.querySelector('input[name="vaga"]:checked');
        if (!vagaSelecionada) {
            mostrarErro('Por favor, selecione uma vaga.');
            return;
        }

        // Mostrar loading
        mostrarLoading();

        // Coletar dados do formulário
        const formData = coletarDadosFormulario(vagaSelecionada.value);

        try {
            // Aguardar Supabase carregar
            const db = await waitForSupabase();
            
            if (!db) {
                throw new Error('Supabase não configurado. Por favor, configure suas credenciais.');
            }

            // Enviar para o Supabase
            const { data, error } = await db
                .from('candidaturas')
                .insert([formData]);

            if (error) {
                throw error;
            }

            // Sucesso
            esconderLoading();
            mostrarSucesso();
            form.reset();
            camposProfessor.classList.add('hidden');
            camposVendedor.classList.add('hidden');

        } catch (error) {
            console.error('Erro ao enviar candidatura:', error);
            esconderLoading();
            mostrarErro(error.message || 'Erro ao enviar candidatura. Tente novamente.');
        }
    });
}

function coletarDadosFormulario(vaga) {
    const dados = {
        vaga: vaga,
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        idade: parseInt(document.getElementById('idade').value) || null,
        bairro: document.getElementById('bairro').value.trim(),
        escolaridade: document.getElementById('escolaridade').value,
        porque_trabalhar: document.getElementById('porque_trabalhar').value.trim(),
        qualidades: document.getElementById('qualidades').value.trim(),
        disponibilidade_inicio: document.getElementById('disponibilidade_inicio').value,
        como_soube: document.getElementById('como_soube').value
    };

    if (vaga === 'professor') {
        dados.curso = document.getElementById('curso').value.trim();
        
        // Coletar matérias selecionadas
        const materiasSelecionadas = [];
        document.querySelectorAll('input[name="materias"]:checked').forEach(cb => {
            materiasSelecionadas.push(cb.value);
        });
        dados.materias = materiasSelecionadas.join(', ');

        dados.experiencia_ensino = document.getElementById('experiencia_ensino').value;

        // Coletar faixas etárias
        const faixasSelecionadas = [];
        document.querySelectorAll('input[name="faixa_etaria"]:checked').forEach(cb => {
            faixasSelecionadas.push(cb.value);
        });
        dados.faixa_etaria = faixasSelecionadas.join(', ');

    } else if (vaga === 'vendedor') {
        dados.experiencia_vendas = document.getElementById('experiencia_vendas').value;

        // Coletar disponibilidade
        const disponibilidadeSelecionada = [];
        document.querySelectorAll('input[name="disponibilidade"]:checked').forEach(cb => {
            disponibilidadeSelecionada.push(cb.value);
        });
        dados.disponibilidade = disponibilidadeSelecionada.join(', ');

        dados.transporte = document.getElementById('transporte').value;
        dados.redes_sociais = document.getElementById('redes_sociais').value;
    }

    return dados;
}

function mostrarLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function esconderLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function mostrarSucesso() {
    document.getElementById('modal-sucesso').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modal-sucesso').classList.add('hidden');
}

function mostrarErro(mensagem) {
    document.getElementById('erro-mensagem').textContent = mensagem;
    document.getElementById('modal-erro').classList.remove('hidden');
}

function fecharModalErro() {
    document.getElementById('modal-erro').classList.add('hidden');
}

// Fechar modais clicando fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});
