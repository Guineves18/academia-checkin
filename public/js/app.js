// ============================================================
// Configuração
// ============================================================
const API = ''; // vazio = mesma origem (http://localhost:3000)

// ============================================================
// Seletores de elementos
// ============================================================
const telas = {
    login: document.getElementById('tela-login'),
    aluno: document.getElementById('tela-aluno'),
    recepcao: document.getElementById('tela-recepcao'),
};

// ============================================================
// Utilitários de navegação
// ============================================================
function mostrarTela(nome) {
    Object.values(telas).forEach(t => t.classList.add('hidden'));
    telas[nome].classList.remove('hidden');
}

function getToken() { return localStorage.getItem('token'); }
function getUsuario() { return JSON.parse(localStorage.getItem('usuario') || 'null'); }

function salvarSessao(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function limparSessao() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
}

// ============================================================
// LOGIN
// ============================================================
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById('erro-login');
    erroEl.classList.add('hidden');

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await res.json();

        if (!res.ok) {
            erroEl.textContent = dados.error || 'Erro ao fazer login.';
            erroEl.classList.remove('hidden');
            return;
        }

        salvarSessao(dados.token, dados.usuario);
        redirecionarPorPapel(dados.usuario);

    } catch {
        erroEl.textContent = 'Não foi possível conectar ao servidor.';
        erroEl.classList.remove('hidden');
    }
});

function redirecionarPorPapel(usuario) {
    if (usuario.papel === 'recepcionista') {
        carregarPainelRecepcao();
        mostrarTela('recepcao');
    } else {
        carregarPainelAluno(usuario);
        mostrarTela('aluno');
    }
}

// ============================================================
// PAINEL DO ALUNO
// ============================================================
function carregarPainelAluno(usuario) {
    document.getElementById('nome-aluno').textContent = usuario.nome;

    // Busca dados atualizados do aluno (plano, vencimento)
    fetch(`${API}/api/checkin`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    // Exibe badge de status (vem do token; para status do plano buscar da API seria ideal,
    // mas como simplificação usamos o que temos no token)
    const badgeEl = document.getElementById('status-plano');
    badgeEl.textContent = 'ativo'; // será atualizado pelo resultado do check-in
    badgeEl.className = 'badge ativo';
}

document.getElementById('btn-checkin').addEventListener('click', async () => {
    const btn = document.getElementById('btn-checkin');
    const resultadoEl = document.getElementById('resultado-checkin');

    btn.disabled = true;
    btn.textContent = 'Registrando...';
    resultadoEl.classList.add('hidden');

    try {
        const res = await fetch(`${API}/api/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const dados = await res.json();

        resultadoEl.classList.remove('hidden', 'sucesso', 'erro', 'aviso');

        if (res.status === 201) {
            resultadoEl.textContent = `✅ ${dados.message} (${dados.hora})`;
            resultadoEl.classList.add('sucesso');
            btn.textContent = '✅ Check-in realizado!';

        } else if (res.status === 409) {
            resultadoEl.textContent = '⚠️ Você já fez check-in hoje.';
            resultadoEl.classList.add('aviso');
            btn.textContent = 'Check-in já realizado hoje';

        } else if (res.status === 403) {
            resultadoEl.textContent = `🚫 ${dados.error}`;
            resultadoEl.classList.add('erro');
            btn.textContent = 'Check-in negado';

            // Atualiza badge para vencido
            const badge = document.getElementById('status-plano');
            badge.textContent = 'vencido';
            badge.className = 'badge vencido';

        } else {
            resultadoEl.textContent = dados.error || 'Erro desconhecido.';
            resultadoEl.classList.add('erro');
            btn.disabled = false;
            btn.textContent = '✅ Fazer Check-in';
        }

    } catch {
        resultadoEl.textContent = 'Erro de conexão com o servidor.';
        resultadoEl.classList.remove('hidden');
        resultadoEl.classList.add('erro');
        btn.disabled = false;
        btn.textContent = '✅ Fazer Check-in';
    }
});

// ============================================================
// PAINEL DA RECEPÇÃO
// ============================================================
async function carregarPainelRecepcao() {
    const tbody = document.getElementById('corpo-tabela');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999">Carregando...</td></tr>';

    try {
        const res = await fetch(`${API}/api/checkin`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const checkins = await res.json();

        if (!Array.isArray(checkins) || checkins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999">Nenhum check-in registrado.</td></tr>';
            return;
        }

        tbody.innerHTML = checkins.map(c => `
            <tr>
                <td>${c.nome}</td>
                <td>${c.email}</td>
                <td>${c.data_checkin}</td>
                <td>${c.hora_checkin}</td>
            </tr>
        `).join('');

    } catch {
        tbody.innerHTML = '<tr><td colspan="4" style="color:red">Erro ao carregar dados.</td></tr>';
    }
}

// ============================================================
// LOGOUT
// ============================================================
document.getElementById('btn-logout-aluno').addEventListener('click', logout);
document.getElementById('btn-logout-recepcao').addEventListener('click', logout);

function logout() {
    limparSessao();
    document.getElementById('form-login').reset();
    document.getElementById('erro-login').classList.add('hidden');
    mostrarTela('login');
}

// ============================================================
// INICIALIZAÇÃO: verifica se já tem sessão salva
// ============================================================
(function init() {
    const token = getToken();
    const usuario = getUsuario();

    if (token && usuario) {
        redirecionarPorPapel(usuario);
    } else {
        mostrarTela('login');
    }
})();