document.addEventListener('DOMContentLoaded', function () {
    // Agrega un checkbox y, si corresponde, un input de cantidad a cada item de menú y agregados
    document.querySelectorAll('.menu-section ul li').forEach(function (li) {
        const texto = li.textContent.trim().toUpperCase();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pedido-checkbox';
        checkbox.value = li.textContent.trim();
        checkbox.style.marginRight = '8px';

        // No agregar contador a CHEDDAR, BACON y 2 PIZZETAS
        if (
            texto !== 'CHEDDAR' &&
            texto !== 'BACON' &&
            texto !== '2 PIZZETAS'
        ) {
            const cantidad = document.createElement('input');
            cantidad.type = 'number';
            cantidad.className = 'cantidad-input';
            cantidad.min = 0;
            cantidad.value = 0;
            cantidad.style.width = '45px';
            cantidad.style.marginLeft = '8px';
            cantidad.style.borderRadius = '5px';
            cantidad.style.border = '1px solid #ccc';
            cantidad.style.padding = '2px 4px';
            li.prepend(cantidad);
        }

        li.prepend(checkbox);
    });

    // Validación de cantidad mínima
    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('input', function () {
            if (parseInt(this.value) < 0 || isNaN(this.value)) this.value = 0;
        });
    });

    // Mostrar/ocultar campo dirección según opción de envío
    const radiosEnvio = document.querySelectorAll('.envio-radio');
    const direccionContainer = document.getElementById('direccion-container');
    if (radiosEnvio.length && direccionContainer) {
        radiosEnvio.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'Para enviar') {
                    direccionContainer.style.display = 'block';
                } else {
                    direccionContainer.style.display = 'none';
                }
            });
        });
    }

    // Modal de previsualización
    const wspBtn = document.getElementById('wsp-float');
    const modal = document.getElementById('modal-preview');
    const previewContent = document.getElementById('preview-content');
    const btnEnviar = document.getElementById('btn-enviar-wsp');
    const btnCerrar = document.getElementById('btn-cerrar-preview');

    let mensajeFinal = '';

    wspBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Artículos seleccionados con cantidad (si tiene input de cantidad)
        const seleccionados = Array.from(document.querySelectorAll('.pedido-checkbox:checked'))
            .map(cb => {
                const cantidadInput = cb.parentElement.querySelector('.cantidad-input');
                if (cantidadInput) {
                    const cantidad = cantidadInput.value;
                    return `- ${cb.value} x${cantidad}`;
                } else {
                    return `- ${cb.value}`;
                }
            });

        // Método de pago seleccionado
        const pagos = Array.from(document.querySelectorAll('.pago-checkbox:checked'))
            .map(cb => cb.value);

        // Forma de envío seleccionada
        const envio = document.querySelector('.envio-radio:checked');
        const direccion = document.getElementById('direccion-envio') ? document.getElementById('direccion-envio').value.trim() : '';
        const nombrePedido = document.getElementById('nombre-pedido') ? document.getElementById('nombre-pedido').value.trim() : '';

        // Validaciones
        if (seleccionados.length === 0) {
            alert('Seleccioná al menos un producto para pedir por WhatsApp.');
            return;
        }
        if (pagos.length === 0) {
            alert('Seleccioná al menos una forma de pago.');
            return;
        }
        if (!envio) {
            alert('Seleccioná si lo pasás a buscar o es para enviar.');
            return;
        }
        if (envio.value === 'Para enviar' && direccion === '') {
            alert('Ingresá la dirección de envío.');
            document.getElementById('direccion-envio').focus();
            return;
        }
        if (nombrePedido === '') {
            alert('Ingresá el nombre de quien recibe el pedido.');
            document.getElementById('nombre-pedido').focus();
            return;
        }

        // Armar mensaje
        mensajeFinal = `Quisiera pedir esto:\n${seleccionados.join('\n')}`;
        mensajeFinal += `\n\nForma de pago: ${pagos.join(', ')}`;
        mensajeFinal += `\n\nEntrega: ${envio.value}`;
        if (envio.value === 'Para enviar') {
            mensajeFinal += `\nDirección: ${direccion}`;
        }
        mensajeFinal += `\n\nNombre: ${nombrePedido}`;

        // Mostrar previsualización
        previewContent.innerText = mensajeFinal;
        modal.style.display = 'flex';
    });

    btnCerrar.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    btnEnviar.addEventListener('click', function () {
        const wspURL = `https://wa.me/3498432943?text=${encodeURIComponent(mensajeFinal)}`;
        window.open(wspURL, '_blank');
        modal.style.display = 'none';
        setTimeout(() => {
            alert('¡Gracias por tu pedido! Te responderemos a la brevedad.');
        }, 500);
    });

    // Cerrar modal al hacer click fuera del cuadro
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

window.addEventListener('DOMContentLoaded', function () {
    const bienvenida = document.getElementById('kenjhi-bienvenida');
    const bienvenidaBtn = document.getElementById('kenjhi-bienvenida-btn');
    if (bienvenida && bienvenidaBtn) {
        bienvenida.style.display = 'flex';
        bienvenidaBtn.onclick = function() {
            bienvenida.style.display = 'none';
        };
    }
});