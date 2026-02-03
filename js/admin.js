// ============================================
// PAINEL ADMINISTRATIVO - PASSOS DO SABER
// ============================================

let candidatosData = [];
let filtroAtual = 'todos';
let candidatoParaExcluir = null;
let favoritosIds = [];
let selectedIds = [];

document.addEventListener('DOMContentLoaded', function() {
    carregarFavoritos();
    initAdmin();
});

function carregarFavoritos() {
    const saved = localStorage.getItem('candidatos_favoritos');
    favoritosIds = saved ? JSON.parse(saved) : [];
}

function salvarFavoritos() {
    localStorage.setItem('candidatos_favoritos', JSON.stringify(favoritosIds));
}

function toggleFavorito(id) {
    const index = favoritosIds.indexOf(id);
    if (index === -1) {
        favoritosIds.push(id);
    } else {
        favoritosIds.splice(index, 1);
    }
    salvarFavoritos();
    atualizarEstatisticas();
    filtrarEExibir();
}

function isFavorito(id) {
    return favoritosIds.includes(id);
}

function initAdmin() {
    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnExport = document.getElementById('btn-export');
    const searchInput = document.getElementById('search-input');
    const orderBy = document.getElementById('order-by');
    const navItems = document.querySelectorAll('.nav-item');
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const selectAll = document.getElementById('select-all');
    const btnFavSelected = document.getElementById('btn-fav-selected');
    const btnUnfavSelected = document.getElementById('btn-unfav-selected');
    const btnWhatsappSelected = document.getElementById('btn-whatsapp-selected');
    const btnCancelSelection = document.getElementById('btn-cancel-selection');

    // Verificar se já está logado
    if (sessionStorage.getItem('admin_logged') === 'true') {
        mostrarDashboard();
    }

    // Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const senha = document.getElementById('admin-senha').value;
        
        if (senha === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_logged', 'true');
            mostrarDashboard();
        } else {
            document.getElementById('login-erro').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('login-erro').classList.add('hidden');
            }, 3000);
        }
    });

    // Logout
    btnLogout.addEventListener('click', function() {
        sessionStorage.removeItem('admin_logged');
        location.reload();
    });

    // Menu Toggle (Mobile/Tablet)
    if (btnMenuToggle) {
        btnMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Atualizar
    btnRefresh.addEventListener('click', carregarCandidatos);

    // Exportar CSV
    btnExport.addEventListener('click', exportarCSV);

    // Busca
    searchInput.addEventListener('input', function() {
        filtrarEExibir();
    });

    // Ordenação
    orderBy.addEventListener('change', function() {
        filtrarEExibir();
    });

    // Navegação
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            filtroAtual = this.dataset.filter;
            atualizarTitulo();
            filtrarEExibir();

            // Fechar sidebar no mobile
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    });

    // Select All
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.candidate-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = this.checked;
            });
            updateSelection();
        });
    }

    // Favoritar selecionados
    if (btnFavSelected) {
        btnFavSelected.addEventListener('click', function() {
            selectedIds.forEach(id => {
                if (!isFavorito(id)) {
                    favoritosIds.push(id);
                }
            });
            salvarFavoritos();
            limparSelecao();
            atualizarEstatisticas();
            filtrarEExibir();
        });
    }

    // Remover favorito dos selecionados
    if (btnUnfavSelected) {
        btnUnfavSelected.addEventListener('click', function() {
            selectedIds.forEach(id => {
                const index = favoritosIds.indexOf(id);
                if (index !== -1) {
                    favoritosIds.splice(index, 1);
                }
            });
            salvarFavoritos();
            limparSelecao();
            atualizarEstatisticas();
            filtrarEExibir();
        });
    }

    // WhatsApp para selecionados
    if (btnWhatsappSelected) {
        btnWhatsappSelected.addEventListener('click', function() {
            const selectedCandidatos = candidatosData.filter(c => selectedIds.includes(c.id));
            if (selectedCandidatos.length === 1) {
                const telefone = selectedCandidatos[0].telefone.replace(/\D/g, '');
                window.open(`https://wa.me/55${telefone}`, '_blank');
            } else {
                // Mostrar lista de contatos para copiar
                const numeros = selectedCandidatos.map(c => `${c.nome}: ${c.telefone}`).join('\n');
                alert('Contatos selecionados:\n\n' + numeros);
            }
            limparSelecao();
        });
    }

    // Cancelar seleção
    if (btnCancelSelection) {
        btnCancelSelection.addEventListener('click', limparSelecao);
    }
}

function updateSelection() {
    const checkboxes = document.querySelectorAll('.candidate-checkbox:checked');
    selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    
    const selectionBar = document.getElementById('selection-bar');
    const selectionCount = document.getElementById('selection-count');
    
    if (selectedIds.length > 0) {
        selectionBar.classList.remove('hidden');
        selectionCount.textContent = selectedIds.length;
    } else {
        selectionBar.classList.add('hidden');
    }

    // Atualizar select all
    const allCheckboxes = document.querySelectorAll('.candidate-checkbox');
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.checked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
    }
}

function limparSelecao() {
    selectedIds = [];
    const checkboxes = document.querySelectorAll('.candidate-checkbox, #select-all');
    checkboxes.forEach(cb => cb.checked = false);
    document.getElementById('selection-bar').classList.add('hidden');
}

function mostrarDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.body.classList.add('logged-in');
    carregarCandidatos();
}

async function carregarCandidatos() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.querySelector('.table-container');

    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tableContainer.style.display = 'none';

    try {
        const db = await waitForSupabase();
        
        if (!db) {
            throw new Error('Supabase não configurado');
        }

        const { data, error } = await db
            .from('candidaturas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        candidatosData = data || [];
        
        loadingState.classList.add('hidden');
        
        atualizarEstatisticas();
        filtrarEExibir();

    } catch (error) {
        console.error('Erro ao carregar candidatos:', error);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.querySelector('h3').textContent = 'Erro ao carregar dados';
        emptyState.querySelector('p').textContent = error.message;
    }
}

function atualizarEstatisticas() {
    const total = candidatosData.length;
    const professores = candidatosData.filter(c => c.vaga === 'professor').length;
    const vendedores = candidatosData.filter(c => c.vaga === 'vendedor').length;
    const favoritos = candidatosData.filter(c => isFavorito(c.id)).length;

    document.getElementById('total-candidatos').textContent = total;
    document.getElementById('total-professores').textContent = professores;
    document.getElementById('total-vendedores').textContent = vendedores;
    document.getElementById('total-favoritos').textContent = favoritos;
}

function atualizarTitulo() {
    const pageTitle = document.getElementById('page-title');
    const titulos = {
        'todos': '<i class="fas fa-users"></i> Todos os Candidatos',
        'professor': '<i class="fas fa-chalkboard-teacher"></i> Candidatos a Professor',
        'vendedor': '<i class="fas fa-handshake"></i> Candidatos a Vendedor',
        'favoritos': '<i class="fas fa-star"></i> Favoritos'
    };
    pageTitle.innerHTML = titulos[filtroAtual];
}

function filtrarEExibir() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const orderBy = document.getElementById('order-by').value;
    const tableContainer = document.querySelector('.table-container');
    const emptyState = document.getElementById('empty-state');

    // Filtrar por vaga ou favoritos
    let candidatosFiltrados = candidatosData;
    if (filtroAtual === 'favoritos') {
        candidatosFiltrados = candidatosData.filter(c => isFavorito(c.id));
    } else if (filtroAtual !== 'todos') {
        candidatosFiltrados = candidatosData.filter(c => c.vaga === filtroAtual);
    }

    // Filtrar por busca
    if (searchTerm) {
        candidatosFiltrados = candidatosFiltrados.filter(c => 
            c.nome.toLowerCase().includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm) ||
            c.telefone.includes(searchTerm)
        );
    }

    // Ordenar
    candidatosFiltrados = ordenarCandidatos(candidatosFiltrados, orderBy);

    // Exibir
    if (candidatosFiltrados.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.classList.remove('hidden');
        emptyState.querySelector('h3').textContent = filtroAtual === 'favoritos' 
            ? 'Nenhum favorito' 
            : 'Nenhum candidato encontrado';
        emptyState.querySelector('p').textContent = filtroAtual === 'favoritos'
            ? 'Marque candidatos como favoritos clicando na estrela.'
            : searchTerm 
                ? 'Tente uma busca diferente.' 
                : 'Ainda não há candidaturas registradas.';
    } else {
        tableContainer.style.display = 'block';
        emptyState.classList.add('hidden');
        renderizarTabela(candidatosFiltrados);
    }

    // Limpar seleção ao mudar filtro
    limparSelecao();
}

function ordenarCandidatos(candidatos, ordem) {
    const sorted = [...candidatos];
    
    switch (ordem) {
        case 'recente':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'antigo':
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'nome':
            sorted.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
    }
    
    return sorted;
}

function renderizarTabela(candidatos) {
    const tbody = document.getElementById('candidates-body');
    tbody.innerHTML = '';

    candidatos.forEach(candidato => {
        const tr = document.createElement('tr');
        const dataFormatada = formatarData(candidato.created_at);
        const telefoneWhatsApp = candidato.telefone.replace(/\D/g, '');
        const ehFavorito = isFavorito(candidato.id);
        const isSelected = selectedIds.includes(candidato.id);

        if (ehFavorito) tr.classList.add('is-favorite');
        if (isSelected) tr.classList.add('selected');

        tr.innerHTML = `
            <td class="td-checkbox">
                <label class="custom-checkbox">
                    <input type="checkbox" class="candidate-checkbox" data-id="${candidato.id}" ${isSelected ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </td>
            <td class="td-fav">
                <button class="btn-favorite ${ehFavorito ? 'is-favorite' : ''}" onclick="toggleFavorito(${candidato.id})" title="${ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    <i class="${ehFavorito ? 'fas' : 'far'} fa-star"></i>
                </button>
            </td>
            <td>
                <strong>${candidato.nome}</strong>
            </td>
            <td>
                <span class="badge ${candidato.vaga}">
                    ${candidato.vaga === 'professor' ? 'Professor' : 'Vendedor'}
                </span>
            </td>
            <td class="hide-mobile">
                <div class="contact-info">
                    <span><i class="fas fa-envelope"></i> ${candidato.email}</span>
                    <span><i class="fas fa-phone"></i> ${candidato.telefone}</span>
                </div>
            </td>
            <td class="hide-tablet">${candidato.idade || '-'} anos</td>
            <td class="hide-tablet">${candidato.bairro || '-'}</td>
            <td class="hide-mobile">${dataFormatada}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-view" onclick="verDetalhes(${candidato.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="https://wa.me/55${telefoneWhatsApp}" target="_blank" class="btn-whatsapp" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <button class="btn-delete" onclick="confirmarExclusao(${candidato.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Adicionar listeners para checkboxes
    document.querySelectorAll('.candidate-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSelection);
    });
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function verDetalhes(id) {
    const candidato = candidatosData.find(c => c.id === id);
    if (!candidato) return;

    const modal = document.getElementById('modal-detalhes');
    const content = document.getElementById('detalhes-content');

    const escolaridadeMap = {
        'fundamental_incompleto': 'Ensino Fundamental Incompleto',
        'fundamental_completo': 'Ensino Fundamental Completo',
        'medio_incompleto': 'Ensino Médio Incompleto',
        'medio_completo': 'Ensino Médio Completo',
        'superior_incompleto': 'Ensino Superior Incompleto',
        'superior_completo': 'Ensino Superior Completo',
        'pos_graduacao': 'Pós-Graduação'
    };

    const experienciaMap = {
        'nao': 'Não, mas tem vontade de aprender',
        'pouca': 'Menos de 1 ano',
        'media': '1 a 3 anos',
        'muita': 'Mais de 3 anos'
    };

    const disponibilidadeMap = {
        'imediato': 'Imediatamente',
        '1_semana': 'Em 1 semana',
        '2_semanas': 'Em 2 semanas',
        '1_mes': 'Em 1 mês'
    };

    let camposEspecificos = '';

    if (candidato.vaga === 'professor') {
        camposEspecificos = `
            <div class="detalhes-section">
                <h4><i class="fas fa-chalkboard-teacher"></i> Informações de Professor</h4>
                <div class="detalhes-grid">
                    ${candidato.curso ? `
                    <div class="detalhe-item">
                        <label>Curso</label>
                        <span>${candidato.curso}</span>
                    </div>
                    ` : ''}
                    <div class="detalhe-item">
                        <label>Matérias</label>
                        <span>${candidato.materias || '-'}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Experiência com Ensino</label>
                        <span>${experienciaMap[candidato.experiencia_ensino] || '-'}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Faixa Etária Preferida</label>
                        <span>${formatarFaixaEtaria(candidato.faixa_etaria)}</span>
                    </div>
                </div>
            </div>
        `;
    } else if (candidato.vaga === 'vendedor') {
        camposEspecificos = `
            <div class="detalhes-section">
                <h4><i class="fas fa-handshake"></i> Informações de Vendedor</h4>
                <div class="detalhes-grid">
                    <div class="detalhe-item">
                        <label>Experiência com Vendas</label>
                        <span>${experienciaMap[candidato.experiencia_vendas] || '-'}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Disponibilidade de Horário</label>
                        <span>${formatarDisponibilidade(candidato.disponibilidade)}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Meio de Transporte</label>
                        <span>${formatarTransporte(candidato.transporte)}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Redes Sociais</label>
                        <span>${formatarRedesSociais(candidato.redes_sociais)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="detalhes-header">
            <div class="detalhes-avatar ${candidato.vaga}">
                <i class="fas fa-${candidato.vaga === 'professor' ? 'chalkboard-teacher' : 'handshake'}"></i>
            </div>
            <div class="detalhes-nome">
                <h2>${candidato.nome}</h2>
                <span class="badge ${candidato.vaga}">
                    ${candidato.vaga === 'professor' ? 'Professor' : 'Vendedor'}
                </span>
            </div>
            <button class="btn-favorite-lg ${isFavorito(candidato.id) ? 'is-favorite' : ''}" onclick="toggleFavoritoModal(${candidato.id})" title="${isFavorito(candidato.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                <i class="${isFavorito(candidato.id) ? 'fas' : 'far'} fa-star"></i>
            </button>
        </div>

        <div class="detalhes-section">
            <h4><i class="fas fa-user"></i> Dados Pessoais</h4>
            <div class="detalhes-grid">
                <div class="detalhe-item">
                    <label>E-mail</label>
                    <span>${candidato.email}</span>
                </div>
                <div class="detalhe-item">
                    <label>Telefone</label>
                    <span>${candidato.telefone}</span>
                </div>
                <div class="detalhe-item">
                    <label>Idade</label>
                    <span>${candidato.idade || '-'} anos</span>
                </div>
                <div class="detalhe-item">
                    <label>Bairro</label>
                    <span>${candidato.bairro || '-'}</span>
                </div>
                <div class="detalhe-item">
                    <label>Escolaridade</label>
                    <span>${escolaridadeMap[candidato.escolaridade] || '-'}</span>
                </div>
                <div class="detalhe-item">
                    <label>Disponibilidade para Início</label>
                    <span>${disponibilidadeMap[candidato.disponibilidade_inicio] || '-'}</span>
                </div>
            </div>
        </div>

        ${camposEspecificos}

        <div class="detalhes-section">
            <h4><i class="fas fa-comments"></i> Motivação</h4>
            <div class="detalhes-grid">
                <div class="detalhe-item full">
                    <label>Por que quer trabalhar conosco?</label>
                    <p>${candidato.porque_trabalhar || '-'}</p>
                </div>
                <div class="detalhe-item full">
                    <label>Principais Qualidades</label>
                    <p>${candidato.qualidades || '-'}</p>
                </div>
            </div>
        </div>

        <div class="detalhes-section">
            <h4><i class="fas fa-info-circle"></i> Outras Informações</h4>
            <div class="detalhes-grid">
                <div class="detalhe-item">
                    <label>Como soube da vaga</label>
                    <span>${formatarComoSoube(candidato.como_soube)}</span>
                </div>
                <div class="detalhe-item">
                    <label>Data da Candidatura</label>
                    <span>${formatarData(candidato.created_at)}</span>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function formatarFaixaEtaria(faixa) {
    if (!faixa) return '-';
    const map = {
        'fundamental1': 'Fundamental I',
        'fundamental2': 'Fundamental II',
        'medio': 'Ensino Médio'
    };
    return faixa.split(', ').map(f => map[f] || f).join(', ');
}

function formatarDisponibilidade(disp) {
    if (!disp) return '-';
    const map = {
        'manha': 'Manhã',
        'tarde': 'Tarde',
        'noite': 'Noite',
        'sabado': 'Sábados'
    };
    return disp.split(', ').map(d => map[d] || d).join(', ');
}

function formatarTransporte(transporte) {
    const map = {
        'carro': 'Sim, carro',
        'moto': 'Sim, moto',
        'bicicleta': 'Sim, bicicleta',
        'nao': 'Transporte público'
    };
    return map[transporte] || '-';
}

function formatarRedesSociais(redes) {
    const map = {
        'muito': 'Muito ativo',
        'moderado': 'Moderadamente',
        'pouco': 'Pouco ativo',
        'nao': 'Não usa'
    };
    return map[redes] || '-';
}

function formatarComoSoube(como) {
    const map = {
        'instagram': 'Instagram',
        'facebook': 'Facebook',
        'whatsapp': 'WhatsApp',
        'indicacao': 'Indicação',
        'outro': 'Outro'
    };
    return map[como] || '-';
}

function fecharModalDetalhes() {
    document.getElementById('modal-detalhes').classList.add('hidden');
}

function confirmarExclusao(id) {
    candidatoParaExcluir = id;
    document.getElementById('modal-excluir').classList.remove('hidden');
    
    document.getElementById('btn-confirmar-excluir').onclick = async function() {
        await excluirCandidato();
    };
}

function fecharModalExcluir() {
    document.getElementById('modal-excluir').classList.add('hidden');
    candidatoParaExcluir = null;
}

async function excluirCandidato() {
    if (!candidatoParaExcluir) return;

    try {
        const db = await waitForSupabase();
        
        if (!db) {
            throw new Error('Supabase não configurado');
        }

        const { error } = await db
            .from('candidaturas')
            .delete()
            .eq('id', candidatoParaExcluir);

        if (error) throw error;

        fecharModalExcluir();
        carregarCandidatos();

    } catch (error) {
        console.error('Erro ao excluir candidato:', error);
        alert('Erro ao excluir candidato: ' + error.message);
    }
}

function exportarCSV() {
    if (candidatosData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    // Filtrar dados atuais
    let dados = candidatosData;
    if (filtroAtual === 'favoritos') {
        dados = candidatosData.filter(c => isFavorito(c.id));
    } else if (filtroAtual !== 'todos') {
        dados = candidatosData.filter(c => c.vaga === filtroAtual);
    }

    // Cabeçalhos
    const headers = [
        'Nome',
        'Vaga',
        'Favorito',
        'Email',
        'Telefone',
        'Idade',
        'Bairro',
        'Escolaridade',
        'Data da Candidatura',
        'Por que quer trabalhar conosco',
        'Qualidades'
    ];

    // Linhas
    const rows = dados.map(c => [
        c.nome,
        c.vaga,
        isFavorito(c.id) ? 'Sim' : 'Não',
        c.email,
        c.telefone,
        c.idade || '',
        c.bairro || '',
        c.escolaridade || '',
        formatarData(c.created_at),
        `"${(c.porque_trabalhar || '').replace(/"/g, '""')}"`,
        `"${(c.qualidades || '').replace(/"/g, '""')}"`
    ]);

    // Criar CSV
    let csv = headers.join(';') + '\n';
    rows.forEach(row => {
        csv += row.join(';') + '\n';
    });

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidaturas_${filtroAtual}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Fechar modais clicando fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Toggle favorito no modal de detalhes
function toggleFavoritoModal(id) {
    toggleFavorito(id);
    // Atualizar o botão no modal
    const btn = document.querySelector('.btn-favorite-lg');
    if (btn) {
        const ehFavorito = isFavorito(id);
        btn.classList.toggle('is-favorite', ehFavorito);
        btn.innerHTML = `<i class="${ehFavorito ? 'fas' : 'far'} fa-star"></i>`;
        btn.title = ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    }
}
