let numeroSecreto = generarNumeroSecreto();
let intentos = 1;
const maxIntentos = 3;

function asignarTextoElemento(elemento, texto) {
    let elementoHTML = document.querySelector(elemento);
    elementoHTML.innerHTML = texto;
}

function verificarIntento() {
    let numeroDeUsuario = parseInt(document.getElementById('valorUsuario').value);
    
    if (numeroDeUsuario === numeroSecreto) {
        asignarTextoElemento('p', `¡Acertaste el número en ${intentos} ${(intentos === 1) ? 'intento' : 'intentos'}!`);
        document.getElementById('reiniciar').removeAttribute('disabled');
        document.getElementById('valorUsuario').setAttribute('disabled', true);
    } else {
        if (numeroDeUsuario > numeroSecreto) {
            asignarTextoElemento('p', 'El número secreto es menor.');
        } else {
            asignarTextoElemento('p', 'El número secreto es mayor.');
        }
        
        intentos++;

        if (intentos > maxIntentos) {
            asignarTextoElemento('p', `¡Se acabaron los intentos! El número secreto era ${numeroSecreto}.`);
            document.getElementById('reiniciar').removeAttribute('disabled');
            document.getElementById('valorUsuario').setAttribute('disabled', true);
        } else {
            limpiarCaja();
        }
    }
}

function limpiarCaja() {
    document.querySelector('#valorUsuario').value = '';
}

function generarNumeroSecreto() {
    return Math.floor(Math.random() * 10) + 1;
}

function reiniciarJuego() {
    numeroSecreto = generarNumeroSecreto();
    intentos = 1;
    asignarTextoElemento('p', 'Indica un número del 1 al 10');
    limpiarCaja();
    document.getElementById('valorUsuario').removeAttribute('disabled');
    document.getElementById('reiniciar').setAttribute('disabled', true);
}

// Asigna textos iniciales
asignarTextoElemento('h1', 'Juego Número Secreto');
asignarTextoElemento('p', 'Indica un número del 1 al 10');

// Agrega evento al botón "Nuevo Juego"
document.getElementById('reiniciar').addEventListener('click', reiniciarJuego);