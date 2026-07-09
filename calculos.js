// --- FUNCIONES MATEMÁTICAS (HARRIS-BENEDICT & MACROS) ---

function calcularObjetivos() {
    const perfil = JSON.parse(localStorage.getItem('perfilFitness'));
    
    // Si no hay perfil guardado, devolvemos ceros por defecto
    if (!perfil) return { kcal: 0, prot: 0, gras: 0, carb: 0 };

    const peso = parseFloat(perfil.peso);
    const altura = parseFloat(perfil.altura);
    const edad = parseInt(perfil.edad);
    const sexo = perfil.sexo;
    const actividad = perfil.actividad;
    const objetivo = perfil.objetivo;

    // 1. Calcular Tasa Metabólica Basal (TMB)
    let tmb = 0;
    if (sexo === 'Masculino') {
        tmb = 66.473 + (13.7516 * peso) + (5.0033 * altura) - (6.755 * edad);
    } else {
        tmb = 655.0955 + (9.5634 * peso) + (1.8496 * altura) - (4.6756 * edad);
    }

    // 2. Multiplicar por el factor de actividad (GET)
    let factorActividad = 1.2; // Sedentario por defecto
    if (actividad === 'Ligero') factorActividad = 1.375;
    if (actividad === 'Moderado') factorActividad = 1.55;
    if (actividad === 'Intenso') factorActividad = 1.725;

    let get = tmb * factorActividad;

    // 3. Ajustar según el objetivo calórico (+500 / -500)
    let kcalObjetivo = Math.round(get);
    if (objetivo === 'Ganar peso') kcalObjetivo += 500;
    if (objetivo === 'Perder peso') kcalObjetivo -= 500;

    // 4. Reparto inteligente de Macros
    // Proteína fija: 2g por kg de peso
    const protObjetivo = Math.round(peso * 2);
    // Grasa fija: 1g por kg de peso
    const grasObjetivo = Math.round(peso * 1);
    
    // El resto de las calorías van para los Carbohidratos
    const kcalRestantes = kcalObjetivo - (protObjetivo * 4) - (grasObjetivo * 9);
    const carbObjetivo = kcalRestantes > 0 ? Math.round(kcalRestantes / 4) : 0;

    return {
        kcal: kcalObjetivo,
        prot: protObjetivo,
        gras: grasObjetivo,
        carb: carbObjetivo
    };
}

// --- ACTUALIZAR LAS BARRAS VISUALMENTE ---

function actualizarBarrasProgreso() {
    // 1. Obtener los objetivos calculados
    const objetivos = calcularObjetivos();
    
    // 2. Obtener lo que llevamos consumido hoy acumulando el diario
    const fechaHoyStr = new Date().toLocaleDateString('es-ES');
    const diario = JSON.parse(localStorage.getItem(`diario_${fechaHoyStr}`)) || [];

    let totalesConsumidos = { kcal: 0, prot: 0, gras: 0, carb: 0 };
    diario.forEach(item => {
        totalesConsumidos.kcal += parseFloat(item.calorias);
        totalesConsumidos.prot += parseFloat(item.proteinas);
        totalesConsumidos.gras += parseFloat(item.grasas);
        totalesConsumidos.carb += parseFloat(item.hidratos);
    });

    // --- RENDERIZAR CÍRCULO DE CALORÍAS ---
    document.getElementById('txtCaloriasConsumidas').innerText = Math.round(totalesConsumidos.kcal);
    document.getElementById('txtCaloriasObjetivo').innerText = objetivos.kcal;
    
    const circleBar = document.getElementById('circleCalorias');
    if (objetivos.kcal > 0) {
        let porcentajeKcal = totalesConsumidos.kcal / objetivos.kcal;
        if (porcentajeKcal > 1) porcentajeKcal = 1; // Tope visual al 100%
        // El perímetro del círculo es 440 (2 * PI * r)
        const offset = 440 - (porcentajeKcal * 440);
        circleBar.style.strokeDashoffset = offset;
    } else {
        circleBar.style.strokeDashoffset = 440;
    }

    // --- RENDERIZAR BARRAS HORIZONTALES (ROJO, VERDE, AZUL) ---
    renderizarMacroLinea('Proteinas', totalesConsumidos.prot, objetivos.prot, 'barProteinas', 'txtProtProgreso');
    renderizarMacroLinea('Grasas', totalesConsumidos.gras, objetivos.gras, 'barGrasas', 'txtGrasProgreso');
    renderizarMacroLinea('Carbohidratos', totalesConsumidos.carb, objetivos.carb, 'barCarbohidratos', 'txtCarbProgreso');
}

function renderizarMacroLinea(nombre, consumido, objetivo, idBarra, idTexto) {
    const barra = document.getElementById(idBarra);
    const texto = document.getElementById(idTexto);
    
    const consRound = consumido.toFixed(1);
    texto.innerText = `${consRound}g / ${objetivo}g`;

    if (objetivo > 0) {
        let pct = (consumido / objetivo) * 100;
        if (pct > 100) pct = 100; // Tope visual
        barra.style.width = `${pct}%`;
    } else {
        barra.style.width = '0%';
    }
}

// Escuchar eventos globales para refrescar las barras en tiempo real
window.addEventListener('load', actualizarBarrasProgreso);
// Creamos un atajo para actualizar desde los otros archivos JS
window.refreshProgress = actualizarBarrasProgreso;

// ==========================================
//  ALGORITMO ASISTENTE DE ÚLTIMA COMIDA
// ==========================================

let recetaSeleccionadaParaCalcular = null;
let resultadoCalculadoInversoGlobal = null;

// Crear dinámicamente los elementos visuales del calculador en el HTML
// para que no tengas que modificar tu index.html a mano.
document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Crear la estructura de la tarjeta del calculador
    const calcCard = document.createElement('div');
    calcCard.style.cssText = "background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-top: 15px;";
    calcCard.innerHTML = `
        <button class="accordion-btn" id="toggleCalcBtn" style="background-color: #6c757d;">
            <span>🧮 Ajustar Receta a mis Macros Restantes</span>
            <span class="accordion-arrow">▼</span>
        </button>
        <div class="accordion-content" id="accordionCalcContent">
            <div style="padding: 0 20px 20px 20px;">
                <p style="font-size: 13px; color: #666; margin-top:0;">
                    Selecciona una de tus recetas guardadas. El sistema calculará cuántos gramos necesitas de cada ingrediente para cuadrar tus barras RGB del día de forma óptima.
                </p>
                <div class="form-group autocomplete-wrapper">
                    <label style="font-weight:bold; font-size:12px;">Buscar Receta Guardada:</label>
                    <input type="text" id="buscarRecetaInversa" placeholder="Ej: Mi Desayuno Pro, Almuerzo Volumen..." autocomplete="off">
                    <ul class="suggestions-list" id="calcRecetaSuggestions" style="top:100%;"></ul>
                </div>
                
                <div id="infoRecetaSeleccionada" style="font-size:13px; color:#555; background:#f8f9fa; padding:10px; border-radius:4px; margin-bottom:12px; display:none;"></div>

                <button type="button" id="btnEjecutarCalculoInverso" class="btn-add-final" style="background-color: #6c757d; display:none;">⚡ Calcular Gramos Ideales</button>

                <div id="resultadoCalculoInversoBox" style="margin-top:15px; padding:15px; border-left:5px solid #6c757d; background:#f1f3f5; display:none;">
                    <h3 style="margin-top:0; font-size:15px; color:#444;">📋 Cantidades calculadas para hoy:</h3>
                    <div id="listaGramosCalculados"></div>
                    <button type="button" id="btnInsertarCalculadoAlDiario" class="btn-add-final" style="margin-top:12px; background-color: #28a745;">Añadir esta combinación al Diario</button>
                </div>
            </div>
        </div>
    `;

    // Insertarlo justo antes del diario (la última tarjeta)
    mainContent.insertBefore(calcCard, mainContent.lastElementChild);

    // Activar el acordeón del nuevo módulo
    const toggleCalcBtn = document.getElementById('toggleCalcBtn');
    const accordionCalcContent = document.getElementById('accordionCalcContent');
    toggleCalcBtn.onclick = () => {
        toggleCalcBtn.classList.toggle('active');
        accordionCalcContent.classList.toggle('open');
    };

    // Configurar buscador/autocompletado de recetas guardadas
    const inputBuscar = document.getElementById('buscarRecetaInversa');
    const sugerenciasUl = document.getElementById('calcRecetaSuggestions');
    const infoBox = document.getElementById('infoRecetaSeleccionada');
    const btnCalcular = document.getElementById('btnEjecutarCalculoInverso');

    inputBuscar.addEventListener('input', () => {
        const texto = inputBuscar.value.toLowerCase();
        sugerenciasUl.innerHTML = '';
        if (!texto) { sugerenciasUl.style.display = 'none'; return; }

        const recetas = JSON.parse(localStorage.getItem('misRecetas')) || [];
        const filtradas = recetas.filter(r => r.nombre.toLowerCase().includes(texto));

        if (filtradas.length > 0) {
            filtradas.forEach(receta => {
                const li = document.createElement('li');
                li.innerText = `🍲 ${receta.nombre}`;
                li.onclick = () => {
                    inputBuscar.value = receta.nombre;
                    recetaSeleccionadaParaCalcular = receta;
                    sugerenciasUl.style.display = 'none';
                    
                    // Mostrar info de qué compone la receta
                    let listaIngsNombres = receta.ingredientes.map(i => i.nombre).join(', ');
                    infoBox.innerHTML = `<strong>Ingredientes a calibrar:</strong> ${listaIngsNombres}`;
                    infoBox.style.display = 'block';
                    btnCalcular.style.display = 'block';
                };
                sugerenciasUl.appendChild(li);
            });
            sugerenciasUl.style.display = 'block';
        } else {
            sugerenciasUl.style.display = 'none';
        }
    });

    // Enlazar los clics de los botones de cálculo e inserción
    btnCalcular.onclick = calcularGramosOptimosReceta;
    document.getElementById('btnInsertarCalculadoAlDiario').onclick = insertarPlatoCalculado;
});

// --- EL ALGORITMO MATEMÁTICO DE OPTIMIZACIÓN POR TANTEO ---
function calcularGramosOptimosReceta() {
    if (!recetaSeleccionadaParaCalcular || !recetaSeleccionadaParaCalcular.ingredientes) return;

    // 1. Calcular qué macros faltan actualmente para llegar al objetivo del día
    // (Asume que en tu calculos.js existe la función calcularObjetivos() o similar)
    let objetivos = { kcal: 2000, proteinas: 150, hidratos: 200, grasas: 65 }; 
    if (typeof calcularObjetivos === 'function') objetivos = calcularObjetivos();

    const fechaHoyStr = new Date().toLocaleDateString('es-ES');
    const diario = JSON.parse(localStorage.getItem(`diario_${fechaHoyStr}`)) || [];
    
    let consumido = { kcal: 0, prot: 0, gras: 0, carb: 0 };
    diario.forEach(item => {
        consumido.kcal += parseFloat(item.calorias) || 0;
        consumido.prot += parseFloat(item.proteinas) || 0;
        consumido.gras += parseFloat(item.grasas) || 0;
        consumido.carb += parseFloat(item.hidratos) || 0;
    });

    let faltante = {
        kcal: Math.max(0, objetivos.kcal - consumido.kcal),
        prot: Math.max(0, objetivos.prot - consumido.prot),
        gras: Math.max(0, objetivos.gras - consumido.gras),
        carb: Math.max(0, objetivos.carb - consumido.carb)
    };

    if (faltante.kcal <= 15) {
        alert("¡Tus barras ya están llenas! No necesitas ajustar ninguna receta.");
        return;
    }

    // 2. Tanteo Inteligente: Inicializar los ingredientes de la receta elegida en 0 gramos
    let porcionesGramos = {};
    recetaSeleccionadaParaCalcular.ingredientes.forEach(ing => {
        porcionesGramos[ing.nombre] = 0;
    });

    let simulado = { kcal: 0, prot: 0, gras: 0, carb: 0 };
    let iteracionesMaximas = 1500; // Límite para evitar bloqueos del navegador (máx 1.5kg de comida)

    for (let i = 0; i < iteracionesMaximas; i++) {
        let defProt = faltante.prot - simulado.prot;
        let defGras = faltante.gras - simulado.gras;
        let defCarb = faltante.carb - simulado.carb;

        // Si estamos a menos de 1.5g de cuadrar todos los macros o nos pasamos de Kcal, paramos
        if (defProt <= 1.5 && defGras <= 1.5 && defCarb <= 1.5) break;
        if (simulado.kcal >= faltante.kcal) break;

        let mejorIngrediente = null;
        let maximaPuntuacion = -99999;

        recetaSeleccionadaParaCalcular.ingredientes.forEach(ing => {
            // Conseguir los valores puros por cada 100g guardados en la base original
            const vBase = ing.valoresBase100g || ing; 
            let pKcal = parseFloat(vBase.calorias) / 100;
            let pProt = parseFloat(vBase.proteinas) / 100;
            let pGras = parseFloat(vBase.grasas) / 100;
            let pCarb = parseFloat(vBase.hidratos) / 100;

            // Si meter 1g más de esto nos hace romper drásticamente el límite calórico, penalizar
            if (simulado.kcal + pKcal > faltante.kcal + 15) return;

            // Fórmula de recompensa basada en lo que más falta nos hace en este momento exacto
            let puntuacion = (pProt * defProt * 4) + (pGras * defGras * 9) + (pCarb * defCarb * 4);

            if (puntuacion > maximaPuntuacion) {
                maximaPuntuacion = puntuacion;
                mejorIngrediente = ing;
            }
        });

        if (!mejorIngrediente) break;

        // Añadir 1 gramo virtual al ingrediente que mejor solucione la carencia
        porcionesGramos[mejorIngrediente.nombre] += 1;
        const vBase = mejorIngrediente.valoresBase100g || mejorIngrediente;
        simulado.kcal += parseFloat(vBase.calorias) / 100;
        simulado.prot += parseFloat(vBase.proteinas) / 100;
        simulado.gras += parseFloat(vBase.grasas) / 100;
        simulado.carb += parseFloat(vBase.hidratos) / 100;
    }

    // 3. Renderizar resultados en la caja gris
    const resultadoBox = document.getElementById('resultadoCalculoInversoBox');
    const listaGramosDiv = document.getElementById('listaGramosCalculados');
    listaGramosDiv.innerHTML = '';

    let htmlLista = '<ul style="margin:5px 0; padding-left:20px; font-size:13px; line-height:1.6;">';
    let nombresConGramos = [];

    recetaSeleccionadaParaCalcular.ingredientes.forEach(ing => {
        let gramosCalculados = porcionesGramos[ing.nombre];
        if (gramosCalculados > 0) {
            htmlLista += `<li><strong>${gramosCalculados}g</strong> de ${ing.nombre}</li>`;
            nombresConGramos.push(`${ing.nombre} (${gramosCalculados}g)`);
        }
    });
    htmlLista += '</ul>';

    listaGramosDiv.innerHTML = htmlLista + `
        <p style="margin-top:10px; font-size:12px; background:#e9ecef; padding:6px; border-radius:4px; font-weight:bold; color:#333;">
            Aporte real del plato: ${Math.round(simulado.kcal)} Kcal | P: ${simulado.prot.toFixed(1)}g | HC: ${simulado.carb.toFixed(1)}g | G: ${simulado.gras.toFixed(1)}g
        </p>
    `;
    resultadoBox.style.display = 'block';

    // Guardar el objeto empaquetado para cuando pulse el botón verde de confirmación
    resultadoCalculadoInversoGlobal = {
        nombre: `${recetaSeleccionadaParaCalcular.nombre} (Ajustado a Macros)`,
        calorias: Math.round(simulado.kcal),
        proteinas: simulado.prot.toFixed(1),
        hidratos: simulado.carb.toFixed(1),
        azucares: "0.0",
        grasas: simulado.gras.toFixed(1),
        saturadas: "0.0"
    };
}

// 4. Pasar el plato calculado al diario reutilizando el localStorage de diario.js
function insertarPlatoCalculado() {
    if (!resultadoCalculadoInversoGlobal) return;

    const fechaHoyStr = new Date().toLocaleDateString('es-ES');
    const claveDiario = `diario_${fechaHoyStr}`;
    
    let diario = JSON.parse(localStorage.getItem(claveDiario)) || [];
    resultadoCalculadoInversoGlobal.id = Date.now();
    diario.push(resultadoCalculadoInversoGlobal);
    
    localStorage.setItem(claveDiario, JSON.stringify(diario));
    
    // Recargar la página para que diario.js pinte el historial e interactúe con el progreso al instante
    window.location.reload();
}