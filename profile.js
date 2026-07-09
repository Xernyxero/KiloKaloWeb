
// Comprobación de que los elementos existen
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const form = document.getElementById('perfilForm');
const perfilDiv = document.getElementById('perfilGuardado');

// Función directa para abrir
openModalBtn.onclick = function() {
    modalOverlay.classList.add('active');
};

// Función directa para cerrar
closeModalBtn.onclick = function() {
    modalOverlay.classList.remove('active');
};

// Cerrar al hacer clic fuera del cuadro blanco
modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
};

// --- LOGICA DE LOCALSTORAGE ---
function mostrarPerfil() {
    const perfil = JSON.parse(localStorage.getItem('perfilFitness'));

    if (perfil) {
        document.getElementById('displayEdad').innerText = perfil.edad;
        document.getElementById('displaySexo').innerText = perfil.sexo;
        document.getElementById('displayAltura').innerText = perfil.altura;
        document.getElementById('displayPeso').innerText = perfil.peso;
        document.getElementById('displayActividad').innerText = perfil.actividad;
        document.getElementById('displayObjetivo').innerText = perfil.objetivo;

        document.getElementById('edad').value = perfil.edad;
        document.getElementById('sexo').value = perfil.sexo;
        document.getElementById('altura').value = perfil.altura;
        document.getElementById('peso').value = perfil.peso;
        document.getElementById('actividad').value = perfil.actividad;
        document.getElementById('objetivo').value = perfil.objetivo;

        perfilDiv.style.display = 'block';
    } else {
        perfilDiv.style.display = 'none';
    }
}

form.onsubmit = function(e) {
    e.preventDefault();

    const perfilUsuario = {
        edad: document.getElementById('edad').value,
        sexo: document.getElementById('sexo').value,
        altura: document.getElementById('altura').value,
        peso: document.getElementById('peso').value,
        actividad: document.getElementById('actividad').value,
        objetivo: document.getElementById('objetivo').value
    };

    localStorage.setItem('perfilFitness', JSON.stringify(perfilUsuario));
    mostrarPerfil();
    
    // ⚡ LÍNEA NUEVA: Refresca las barras y calorías de la página principal en tiempo real
    if (typeof window.refreshProgress === 'function') {
        window.refreshProgress();
    }

    alert('¡Perfil guardado!');
    modalOverlay.classList.remove('active');
};

function borrarPerfil() {
    if(confirm('¿Seguro que quieres borrar tus datos?')) {
        localStorage.removeItem('perfilFitness');
        form.reset();
        mostrarPerfil();
    }
}

// Inicializar
mostrarPerfil();