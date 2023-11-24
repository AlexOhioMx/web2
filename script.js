document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const rangeText = document.getElementById('rangeText');
    const guessInput = document.getElementById('guess');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const correctSound = document.getElementById('correctSound');
    const incorrectSound = document.getElementById('incorrectSound');
    const scoreElement = document.getElementById('scoreValue');
    const livesElement = document.getElementById('livesValue');

    let rangoInicio = 1;
    let rangoFin = 50;
    let pokemonCorrecto = generarNumeroAleatorioEnRango(rangoInicio, rangoFin);
    let pistas = [];

    let score = 0;
    let vidas = 3;

    function generarNumeroAleatorioEnRango(inicio, fin) {
        return Math.floor(Math.random() * (fin - inicio + 1)) + inicio;
    }

    function obtenerPistas(apiUrl) {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                pistas = [
                    `Pista: El Pokémon pertenece al tipo ${data.types[0].type.name}.`,
                    `Pista: Su habilidad es ${data.abilities[0].ability.name}.`,
                    `Pista: Tiene una base de experiencia de ${data.base_experience}.`
                ];
            })
            .catch(error => {
                console.error('Error al obtener datos de la API:', error);
            });
    }

    function actualizarBarraDeVidas() {
        const livesDiv = document.getElementById('lives');
        livesDiv.innerHTML = `Vidas: ${'❤️'.repeat(vidas)}`;
    }

    function resetearJuego() {
        score = 0;
        vidas = 3;
        rangoInicio = 1;
        rangoFin = 50;
        pokemonCorrecto = generarNumeroAleatorioEnRango(rangoInicio, rangoFin);
        obtenerPistas(`https://pokeapi.co/api/v2/pokemon/${pokemonCorrecto}/`);
        rangeText.textContent = `El Pokémon está entre los números ${rangoInicio} y ${rangoFin}.`;
        actualizarBarraDeVidas();
        scoreElement.textContent = score;
        guessInput.value = '';
        submitBtn.disabled = false;
        output.innerHTML = '';
    }

    // Inicializar la barra de vidas al cargar la página
    actualizarBarraDeVidas();

    obtenerPistas(`https://pokeapi.co/api/v2/pokemon/${pokemonCorrecto}/`);
    rangeText.textContent = `El Pokémon está entre los números ${rangoInicio} y ${rangoFin}.`;

    submitBtn.addEventListener('click', function () {
        const guess = guessInput.value.trim().toLowerCase(); // Convertir a minúsculas y quitar espacios al inicio y al final

        if (guess) {
            const apiUrlNumber = `https://pokeapi.co/api/v2/pokemon/${pokemonCorrecto}/`;
            const apiUrlName = `https://pokeapi.co/api/v2/pokemon/${guess}/`;

            Promise.all([fetch(apiUrlNumber), fetch(apiUrlName)])
                .then(responses => Promise.all(responses.map(response => response.json())))
                .then(([pokemonCorrectoData, guessedPokemonData]) => {
                    const guessedPokemonName = guessedPokemonData.name;
                    const guessedPokemonAbility = guessedPokemonData.abilities[0].ability.name;

                    output.innerHTML = `
                        <img src="${guessedPokemonData.sprites.front_default}" alt="${guessedPokemonName}">
                        <h3>${guessedPokemonName}</h3>
                        <p>Poder: ${guessedPokemonAbility}</p>
                    `;

                    if (pokemonCorrectoData.name === guessedPokemonName.toLowerCase() || pokemonCorrectoData.id === guessedPokemonData.id) {
                        correctSound.play();
                        score++;
                        rangoInicio += 50;
                        rangoFin += 50;
                        pokemonCorrecto = generarNumeroAleatorioEnRango(rangoInicio, rangoFin);
                        obtenerPistas(`https://pokeapi.co/api/v2/pokemon/${pokemonCorrecto}/`);
                        rangeText.textContent = `¡Correcto! El Pokémon está entre los números ${rangoInicio} y ${rangoFin}.`;
                    } else {
                        incorrectSound.play();
                        vidas--;
                        const pistaAleatoria = pistas[Math.floor(Math.random() * pistas.length)];
                        rangeText.innerHTML = `Incorrecto. El Pokémon está entre los números ${rangoInicio} y ${rangoFin}. ${pistaAleatoria}`;
                        if (vidas === 0) {
                            // Fin del juego si se quedan sin vidas
                            output.innerHTML = `<p class="text-danger">¡Perdiste todas tus vidas! Puntuación final: ${score}</p>`;
                            submitBtn.disabled = true;
                        }
                    }

                    // Actualizar la barra de vidas
                    actualizarBarraDeVidas();

                    // Actualizar la puntuación
                    scoreElement.textContent = score;
                })
                .catch(error => {
                    console.error('Error al obtener datos de la API:', error);
                    incorrectSound.play();
                    rangeText.textContent = `El Pokémon está entre los números ${rangoInicio} y ${rangoFin}.`;
                });
        } else {
            output.innerHTML = `<p class="text-danger">Por favor, ingresa el nombre o el número del Pokémon.</p>`;
            incorrectSound.play();
            rangeText.innerHTML = `El Pokémon está entre los números ${rangoInicio} y ${rangoFin}. ${pistas[0]}`;
        }
    });

    resetBtn.addEventListener('click', function () {
        resetearJuego();
    });
});
