// --- CONFIGURACIÓN DE INTERFAZ Y ESTADOS ---
let modoActual = 'ingrediente';
let ingredientesDelPlatoActual = []; // Lista temporal de ingredientes antes de empaquetar la receta

const fechaActualStr = new Date().toLocaleDateString('es-ES');
document.getElementById('fechaHoy').innerText = fechaActualStr;

const comidaForm = document.getElementById('comidaForm');
const inputNombre = document.getElementById('alimentoNombre');
const inputCantidad = document.getElementById('alimentoCantidad');
const grupoCantidad = document.getElementById('grupoCantidad');
const suggestionsList = document.getElementById('suggestionsList');
const listaComidasDiv = document.getElementById('listaComidas');

const btnAgregarIngrediente = document.getElementById('btnAgregarIngrediente');
const btnAgregarDirecto = document.getElementById('btnAgregarDirecto');
const recetaBuilderBox = document.getElementById('recetaBuilderBox');

// Desplegable general
document.getElementById('toggleFormBtn').onclick = function() {
    this.classList.toggle('active');
    document.getElementById('accordionContent').classList.toggle('open');
};

// Control de Pestañas
function cambiarTab(modo) {
    modoActual = modo;
    
    // Cambiar las clases visuales de los botones superiores
    document.getElementById('tabIngredienteBtn').classList.toggle('active', modo === 'ingrediente');
    document.getElementById('tabCompletaBtn').classList.toggle('active', modo === 'completa');
    
    const grupoPorciones = document.getElementById('grupoPorciones');
    const grupoCantidad = document.getElementById('grupoCantidad');
    const contenedorMacros = document.getElementById('contenedorMacros');

    // Cambiar dinámicamente las etiquetas de los textos informativos
    const lblNombre = document.getElementById('lblNombre');
    const btnAgregarIngrediente = document.getElementById('btnAgregarIngrediente');
    const btnAgregarDirecto = document.getElementById('btnAgregarDirecto');

    if (modo === 'completa') {
        if (grupoCantidad) grupoCantidad.style.display = 'none';
        if (grupoPorciones) grupoPorciones.style.display = 'block';
        if (contenedorMacros) contenedorMacros.style.display = 'block'; 
        
        if (btnAgregarIngrediente) btnAgregarIngrediente.style.display = 'none';
        if (btnAgregarDirecto) btnAgregarDirecto.style.display = 'block';
        if (recetaBuilderBox) recetaBuilderBox.style.display = 'none';
        if (lblNombre) lblNombre.innerText = "Nombre de la Comida / Receta Guardada:";
    } else {
        if (grupoCantidad) grupoCantidad.style.display = 'block'; 
        if (grupoPorciones) grupoPorciones.style.display = 'none';   
        if (contenedorMacros) contenedorMacros.style.display = 'block'; 
        
        if (btnAgregarIngrediente) btnAgregarIngrediente.style.display = 'block';
        if (btnAgregarDirecto) btnAgregarDirecto.style.display = 'none';
        if (ingredientesDelPlatoActual.length > 0) {
            if (recetaBuilderBox) recetaBuilderBox.style.display = 'block';
        }
        if (lblNombre) lblNombre.innerText = "Nombre del Ingrediente:";
    }
    
    // Resetear de forma segura el formulario si existe
    if (comidaForm) {
        comidaForm.reset();
        document.getElementById('recetaPorciones').value = 1;
        document.getElementById('alimentoCantidad').value = 100;
    }
}

// --- MANEJO DE BASES DE DATOS LOCALES ---
function obtenerBaseIngredientes() { return JSON.parse(localStorage.getItem('misAlimentos')) || []; }
function guardarBaseIngrediente(ing) {
    let base = obtenerBaseIngredientes();
    if (!base.some(a => a.nombre.toLowerCase() === ing.nombre.toLowerCase())) {
        base.push(ing);
        localStorage.setItem('misAlimentos', JSON.stringify(base));
    }
}
function obtenerBaseRecetas() { return JSON.parse(localStorage.getItem('misRecetas')) || []; }
function guardarBaseReceta(receta) {
    let base = obtenerBaseRecetas();
    if (!base.some(r => r.nombre.toLowerCase() === receta.nombre.toLowerCase())) {
        base.push(receta);
        localStorage.setItem('misRecetas', JSON.stringify(base));
    }
}

// --- BUSCADOR INTELIGENTE / AUTOCOMPLETADO MIXTO ---
inputNombre.addEventListener('input', () => {
    const texto = inputNombre.value.toLowerCase();
    suggestionsList.innerHTML = '';
    if (!texto) { suggestionsList.style.display = 'none'; return; }

    // El buscador se adapta según la pestaña activa
    if (modoActual === 'ingrediente') {
        const ingredientes = obtenerBaseIngredientes();
        const filtrados = ingredientes.filter(i => i.nombre.toLowerCase().includes(texto));
        renderizarSugerencias(filtrados);
    } else {
        // En modo "Comida Rápida" busca tanto en recetas guardadas como en ingredientes puros
        const recetas = obtenerBaseRecetas();
        const ingredientes = obtenerBaseIngredientes();
        const unificado = [...recetas.map(r => ({...r, esReceta: true})), ...ingredients];
        const filtrados = unificado.filter(f => f.nombre.toLowerCase().includes(texto));
        renderizarSugerencias(filtrados);
    }
});

function renderizarSugerencias(lista) {
    if (lista.length === 0) { suggestionsList.style.display = 'none'; return; }
    lista.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.esReceta ? `🍲 ${item.nombre} (Receta)` : `🍏 ${item.nombre}`;
        li.onclick = () => seleccionarElemento(item);
        suggestionsList.appendChild(li);
    });
    suggestionsList.style.display = 'block';
}

function seleccionarElemento(item) {
    inputNombre.value = item.nombre;
    document.getElementById('calorias').value = item.calorias;
    document.getElementById('proteinas').value = item.proteinas;
    document.getElementById('hidratos').value = item.hidratos;
    document.getElementById('azucares').value = item.azucares;
    document.getElementById('grasas').value = item.grasas;
    document.getElementById('saturadas').value = item.saturadas;
    suggestionsList.style.display = 'none';
}

document.addEventListener('click', (e) => { if (e.target !== inputNombre) suggestionsList.style.display = 'none'; });

// --- LÓGICA PASO A PASO: CONSTRUIR UN PLATO ---
btnAgregarIngrediente.onclick = function() {
    // 1. CAPTURAR LOS VALORES DIRECTOS DEL FORMULARIO
    const nombreIng = inputNombre.value.trim();
    const gramos = parseFloat(inputCantidad.value);
    
    const kcalInput = document.getElementById('calorias').value;
    const protInput = document.getElementById('proteinas').value;
    const hcInput = document.getElementById('hidratos').value;
    const azuInput = document.getElementById('azucares').value;
    const grasInput = document.getElementById('grasas').value;
    const satInput = document.getElementById('saturadas').value;

    // 2. VALIDACIÓN ESTRICTA: Si falta CUALQUIER dato numérico por 100g, se frena el proceso
    if (!nombreIng || kcalInput === "" || protInput === "" || hcInput === "" || 
        azuInput === "" || grasInput === "" || satInput === "" || !gramos) {
        
        alert("⚠️ ERROR: Debes introducir el nombre, los gramos consumidos y TODOS los macronutrientes correspondientes a los 100g de este ingrediente para poder continuar.");
        return; 
    }

    // 3. PASAR A NÚMEROS UNA VEZ COMPROBADO QUE EXISTEN
    const kcalBase = parseFloat(kcalInput);
    const protBase = parseFloat(protInput);
    const hcBase = parseFloat(hcInput);
    const azuBase = parseFloat(azuInput);
    const grasBase = parseFloat(grasInput);
    const satBase = parseFloat(satInput);

    // 4. Guardar de forma permanente en la base de datos de ingredientes (por 100g) si es nuevo
    const nuevoIngredienteBase = {
        nombre: nombreIng, calorias: kcalBase, proteinas: protBase,
        hidratos: hcBase, azucares: azuBase, grasas: grasBase, saturadas: satBase
    };
    guardarBaseIngrediente(nuevoIngredienteBase);

    // 5. Calcular los macros reales proporcionales a los gramos consumidos en esta ronda
    const factor = gramos / 100;
    const ingCalculado = {
        nombre: nombreIng, 
        gramosOriginales: gramos, 
        calorias: Math.round(kcalBase * factor),
        proteinas: parseFloat((protBase * factor).toFixed(1)),
        hidratos: parseFloat((hcBase * factor).toFixed(1)),
        azucares: parseFloat((azuBase * factor).toFixed(1)),
        grasas: parseFloat((grasBase * factor).toFixed(1)),
        saturadas: parseFloat((satBase * factor).toFixed(1)),
        valoresBase100g: nuevoIngredienteBase 
    };

    // 6. Añadir a la lista en construcción
    ingredientesDelPlatoActual.push(ingCalculado);
    actualizarPanelTemporal();
    
    // Limpiar formulario para el próximo ingrediente
    inputNombre.value = '';
    document.getElementById('calorias').value = '';
    document.getElementById('proteinas').value = '';
    document.getElementById('hidratos').value = '';
    document.getElementById('azucares').value = '';
    document.getElementById('grasas').value = '';
    document.getElementById('saturadas').value = '';
    inputCantidad.value = 100;
};

function actualizarPanelTemporal() {
    const ul = document.getElementById('listaTemporalIngredientes');
    ul.innerHTML = '';
    
    let tKcal = 0, tProt = 0, tHc = 0, tAzu = 0, tGras = 0, tSat = 0;

    ingredientesDelPlatoActual.forEach((ing, index) => {
        tKcal += ing.calorias; tProt += ing.proteinas; tHc += ing.hidratos;
        tAzu += ing.azucares; tGras += ing.grasas; tSat += ing.saturadas;

        const li = document.createElement('li');
        li.innerHTML = `• ${ing.nombre} (${ing.gramosOriginales}g) → <span style="color:#28a745;">${ing.calorias} Kcal</span> [P: ${ing.proteinas}g] 
        <button type="button" onclick="eliminarIngredienteTemporal(${index})" style="background:none; border:none; color:red; cursor:pointer;">×</button>`;
        ul.appendChild(li);
    });

    document.getElementById('resumenMacrosPlato').innerText = `${tKcal} Kcal | P: ${tProt.toFixed(1)}g | HC: ${tHc.toFixed(1)}g | G: ${tGras.toFixed(1)}g`;

    if (ingredientesDelPlatoActual.length > 0) {
        recetaBuilderBox.style.display = 'block';
    } else {
        recetaBuilderBox.style.display = 'none';
    }
}

function eliminarIngredienteTemporal(index) {
    ingredientesDelPlatoActual.splice(index, 1);
    actualizarPanelTemporal();
}

// --- FINALIZAR Y GUARDAR LA RECETA COMPLETA ---
function guardarYComerReceta() {
    const nombreReceta = document.getElementById('recetaNombreFinal').value.trim();
    if (!nombreReceta) { alert("Ponle un nombre a tu receta/plato final."); return; }

    // Sumar todos los ingredientes acumulados
    let comidaFinal = {
        id: Date.now(),
        nombre: nombreReceta,
        calorias: 0, proteinas: 0, hidratos: 0, azucares: 0, grasas: 0, saturadas: 0,
        ingredientes: [...ingredientesDelPlatoActual] // Guardamos los ingredientes individuales integrados
    };

    ingredientesDelPlatoActual.forEach(ing => {
        comidaFinal.calorias += ing.calorias;
        comidaFinal.proteinas += ing.proteinas;
        comidaFinal.hidratos += ing.hidratos;
        comidaFinal.azucares += ing.azucares;
        comidaFinal.grasas += ing.grasas;
        comidaFinal.saturadas += ing.saturadas;
    });

    comidaFinal.proteinas = parseFloat(comidaFinal.proteinas.toFixed(1));
    comidaFinal.hidratos = parseFloat(comidaFinal.hidratos.toFixed(1));
    comidaFinal.azucares = parseFloat(comidaFinal.azucares.toFixed(1));
    comidaFinal.grasas = parseFloat(comidaFinal.grasas.toFixed(1));
    comidaFinal.saturadas = parseFloat(comidaFinal.saturadas.toFixed(1));

    // 1. Guardar en la Base de Datos de Recetas/Comidas
    guardarBaseReceta(comidaFinal);

    // 2. Añadir al diario de hoy
    guardarEnDiario(comidaFinal);

    // Resetear constructor
    ingredientesDelPlatoActual = [];
    actualizarPanelTemporal();
    document.getElementById('recetaNombreFinal').value = '';
}

// --- ENTRADA DIRECTA (PESTAÑA COMIDA RÁPIDA) ---
comidaForm.onsubmit = function(e) {
    e.preventDefault();
    if (modoActual !== 'completa') return; 

    const porciones = parseFloat(document.getElementById('recetaPorciones').value) || 1;
    const nombreOriginal = inputNombre.value;
    const nombreFinalDiario = porciones !== 1 ? `${nombreOriginal} (x${porciones} porciones)` : nombreOriginal;

    const itemDirecto = {
        id: Date.now(),
        nombre: nombreFinalDiario,
        calorias: Math.round(parseFloat(document.getElementById('calorias').value) * porciones),
        proteinas: (parseFloat(document.getElementById('proteinas').value) * porciones).toFixed(1),
        hidratos: (parseFloat(document.getElementById('hidratos').value) * porciones).toFixed(1),
        azucares: (parseFloat(document.getElementById('azucares').value) * porciones).toFixed(1),
        grasas: (parseFloat(document.getElementById('grasas').value) * porciones).toFixed(1),
        saturadas: (parseFloat(document.getElementById('saturadas').value) * porciones).toFixed(1)
    };

    guardarEnDiario(itemDirecto);
    comidaForm.reset();
    document.getElementById('recetaPorciones').value = 1;
};

// --- DIARIO HISTÓRICO ---
function obtenerDiarioHoy() {
    const claveDiario = `diario_${fechaActualStr}`;
    return JSON.parse(localStorage.getItem(claveDiario)) || [];
}

function guardarEnDiario(item) {
    const claveDiario = `diario_${fechaActualStr}`;
    let diario = obtenerDiarioHoy();
    diario.push(item);
    localStorage.setItem(claveDiario, JSON.stringify(diario));
    mostrarDiario();
    if (window.refreshProgress) window.refreshProgress();
}

function mostrarDiario() {
    const diario = obtenerDiarioHoy();
    listaComidasDiv.innerHTML = '';
    if (diario.length === 0) {
        listaComidasDiv.innerHTML = '<p style="color:#aaa; text-align:center;">No has registrado comidas hoy.</p>';
        return;
    }
    diario.forEach(item => {
        const div = document.createElement('div');
        div.className = 'comida-item';
        div.innerHTML = `
            <div class="comida-info">
                <p><strong>${item.nombre}</strong> — <span style="color:#28a745; font-weight:bold;">${item.calorias} Kcal</span></p>
                <p class="comida-macros">P: ${item.proteinas}g | HC: ${item.hidratos}g (Azú: ${item.azucares}g) | G: ${item.grasas}g</p>
            </div>
            <button class="btn-delete" onclick="eliminarComida(${item.id})">&times;</button>
        `;
        listaComidasDiv.appendChild(div);
    });
}

function eliminarComida(id) {
    const claveDiario = `diario_${fechaActualStr}`;
    let diario = obtenerDiarioHoy();
    diario = diario.filter(item => item.id !== id);
    localStorage.setItem(claveDiario, JSON.stringify(diario));
    mostrarDiario();
    if (window.refreshProgress) window.refreshProgress();
}

// Carga inicial
mostrarDiario();
// Forzar el estado inicial correcto al cargar la página
cambiarTab('ingrediente');