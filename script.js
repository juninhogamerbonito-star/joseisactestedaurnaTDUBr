let sequenciaNum = "";
let estadoBranco = false;
let audioUrna = null; 
let fotoCarregada = false;
let somCarregado = false;

// Estado Global do TDUBR (carrega a permissão salva)
let globalPermitido = localStorage.getItem("tdubr_permissao") === "true";

// Configura o sistema ao abrir
setTimeout(() => {
    atualizarBotaoMenu();
    if (globalPermitido) {
        const fotoSalva = localStorage.getItem("cache_foto_isac");
        const somSalvo = localStorage.getItem("cache_som_fim");
        if (fotoSalva) { document.getElementById('foto-candidato-dinamica').src = fotoSalva; fotoCarregada = true; }
        if (somSalvo) { audioUrna = new Audio(somSalvo); audioUrna.load(); somCarregado = true; }
    }
}, 100);

function atualizarBotaoMenu() {
    const btnTreinar = document.getElementById('btn-treinar');
    if (btnTreinar) {
        if (globalPermitido) {
            btnTreinar.className = "btn-menu verde";
        } else {
            btnTreinar.className = "btn-menu cinza";
        }
    }
}

// Lógica de Entrada Modificada com o Aviso em Vermelho na Tela
function tentarEntrarNaUrna() {
    const divErro = document.getElementById('erro-menu');
    if (!globalPermitido) {
        divErro.style.display = 'block'; // Mostra a caixa vermelha
        
        // Remove a animação e adiciona de novo para resetar o efeito se clicar várias vezes
        divErro.style.animation = 'none';
        setTimeout(() => { divErro.style.animation = ''; }, 10);
    } else {
        divErro.style.display = 'none';
        document.getElementById('tela-menu').style.display = 'none';
        document.getElementById('urna-sistema').style.display = 'flex';
    }
}

function abrirPainelAdmin() {
    let senhaDigitada = prompt("Digite a senha do painel:");
    if (senhaDigitada === "TDUBRBlue") {
        document.getElementById('modal-admin').style.display = 'flex';
        document.getElementById('erro-menu').style.display = 'none'; // Limpa erros antigos
    } else if (senhaDigitada !== null) {
        alert("Senha Incorreta! Acesso negado.");
    }
}

function fecharPainelAdmin() {
    document.getElementById('modal-admin').style.display = 'none';
}

function voltarParaOMenu() {
    document.getElementById('urna-sistema').style.display = 'none';
    document.getElementById('tela-menu').style.display = 'flex';
    limparSelecao();
}

function dispararUploadFoto() { document.getElementById('upload-foto').click(); }
function dispararUploadSom() { document.getElementById('upload-som').click(); }

function carregarImagem(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            document.getElementById('foto-candidato-dinamica').src = e.target.result;
            localStorage.setItem("cache_foto_isac", e.target.result);
            fotoCarregada = true;
            document.getElementById('status-foto').style.display = 'block'; 
            verificarRequisitosPainel();
        }
        leitor.readAsDataURL(input.files[0]);
    }
}

function carregarAudio(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const urlAudio = URL.createObjectURL(input.files[0]);
        audioUrna = new Audio(urlAudio);
        audioUrna.load(); 
        
        const leitorSom = new FileReader();
        leitorSom.onload = function(e) {
            localStorage.setItem("cache_som_fim", e.target.result);
        }
        leitorSom.readAsDataURL(input.files[0]);

        somCarregado = true;
        document.getElementById('status-som').style.display = 'block'; 
        verificarRequisitosPainel();
    }
}

function verificarRequisitosPainel() {
    if (fotoCarregada && somCarregado) {
        document.getElementById('btn-permitir-global').style.display = 'block';
    }
}

function ativarLiberacaoGlobal() {
    globalPermitido = true;
    localStorage.setItem("tdubr_permissao", "true");
    atualizarBotaoMenu();
    fecharPainelAdmin();
    alert("Pronto! Globalmente liberado para votar. Mídias configuradas com sucesso.");
}

// MECÂNICA INTERNA DA URNA
function digitar(n) {
    if (sequenciaNum.length < 2 && !estadoBranco) {
        sequenciaNum += n;
        atualizarInterface();
    }
}

function atualizarInterface() {
    let s1 = document.getElementById('slot1');
    let s2 = document.getElementById('slot2');
    document.getElementById('erro-urna').style.display = 'none'; // Esconde erro ao digitar
    
    if (sequenciaNum.length === 0) {
        s1.innerHTML = ""; s1.classList.add('piscar');
        s2.innerHTML = ""; s2.classList.remove('piscar');
    } else if (sequenciaNum.length === 1) {
        s1.innerHTML = sequenciaNum; s1.classList.remove('piscar');
        s2.innerHTML = ""; s2.classList.add('piscar');
        document.getElementById('titulo-voto').style.visibility = 'visible';
    } else if (sequenciaNum.length === 2) {
        s2.innerHTML = sequenciaNum.substring(1, 2); s2.classList.remove('piscar');
        document.getElementById('instrucoes').style.display = 'block';
        
        if (sequenciaNum === "22") {
            document.getElementById('ficha-candidato').innerHTML = `<p>Nome: <strong>JOSÉ ISAC</strong></p><p>Partido: <strong>PL</strong></p>`;
            document.getElementById('ficha-candidato').style.display = 'block';
            document.getElementById('foto-visor').style.display = 'block';
        } else {
            document.getElementById('ficha-candidato').innerHTML = "<br><strong class='pisca-suave' style='font-size:24px; color:#000; display:block;'>VOTO NULO</strong>";
            document.getElementById('ficha-candidato').style.display = 'block';
        }
    }
}

function limparSelecao() {
    sequenciaNum = "";
    estadoBranco = false;
    document.getElementById('titulo-voto').style.visibility = 'hidden';
    document.getElementById('ficha-candidato').style.display = 'none';
    document.getElementById('ficha-candidato').innerHTML = `<p>Nome: <strong id="candidato-nome">JOSÉ ISAC</strong></p><p>Partido: <strong id="candidato-partido">PL</strong></p>`;
    document.getElementById('foto-visor').style.display = 'none';
    document.getElementById('instrucoes').style.display = 'none';
    document.getElementById('slot1').style.display = 'inline-flex';
    document.getElementById('slot2').style.display = 'inline-flex';
    document.getElementById('erro-urna').style.display = 'none';
    atualizarInterface();
}

function votarBranco() {
    if (sequenciaNum === "") {
        estadoBranco = true;
        document.getElementById('erro-urna').style.display = 'none';
        document.getElementById('titulo-voto').style.visibility = 'visible';
        document.getElementById('slot1').style.display = 'none';
        document.getElementById('slot2').style.display = 'none';
        document.getElementById('ficha-candidato').innerHTML = "<br><strong class='pisca-suave' style='font-size:24px; color:#000; display:block;'>VOTO EM BRANCO</strong>";
        document.getElementById('ficha-candidato').style.display = 'block';
        document.getElementById('instrucoes').style.display = 'block';
    }
}

function executarConfirmacao() {
    if (document.getElementById('urna-sistema').style.display === 'none') return;

    // NOVO AVISO DE ERRO EM VERMELHO DENTRO DA URNA (Substituindo o alert antigo)
    if (sequenciaNum.length < 2 && !estadoBranco) {
        try {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime); 
            osc.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } catch(e) { console.log(e); }
        
        const divErroUrna = document.getElementById('erro-urna');
        divErroUrna.style.display = 'block'; // Exibe o texto de erro interno vermelho
        return; 
    }

    document.getElementById('painel-voto').style.display = 'none';
    const telaGravando = document.getElementById('tela-gravando');
    const barra = document.getElementById('progresso-barra');
    telaGravando.style.display = 'flex';
    barra.style.width = '0%';

    let progresso = 0;
    let intervaloBarra = setInterval(() => {
        progresso += 4;
        barra.style.width = progresso + '%';
        
        if (progresso >= 100) {
            clearInterval(intervaloBarra);
            
            if (audioUrna) {
                audioUrna.currentTime = 0;
                audioUrna.play().catch(e => console.log("Erro ao reproduzir áudio:", e));
            }

            telaGravando.style.display = 'none';
            document.getElementById('tag-treinamento').style.display = 'none';
            document.getElementById('fim-visor').style.display = 'flex';
            
            setTimeout(() => {
                document.getElementById('painel-voto').style.display = 'flex';
                document.getElementById('tag-treinamento').style.display = 'block';
                document.getElementById('fim-visor').style.display = 'none';
                limparSelecao();
            }, 3000);
        }
    }, 50); 
}

// CAPTURA DO TECLADO DO PC
document.addEventListener('keydown', (event) => {
    if (document.getElementById('urna-sistema').style.display === 'none') return;

    const tecla = event.key;

    if (tecla >= '0' && tecla <= '9') {
        digitar(tecla);
    } 
    else if (tecla === 'Enter') {
        executarConfirmacao();
    } 
    else if (tecla === 'Backspace' || tecla === 'Delete') {
        limparSelecao();
    } 
    else if (tecla === ' ') {
        event.preventDefault(); 
        votarBranco();
    }
});
