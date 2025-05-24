document.addEventListener('DOMContentLoaded', function () {
    // Agrega un checkbox a cada item de menú y agregados
    document.querySelectorAll('.menu-section ul li').forEach(function (li) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pedido-checkbox';
        checkbox.value = li.textContent.trim();
        checkbox.style.marginRight = '8px';
        li.prepend(checkbox);
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

        // Artículos seleccionados
        const seleccionados = Array.from(document.querySelectorAll('.pedido-checkbox:checked'))
            .map(cb => '- ' + cb.value);

        // Método de pago seleccionado
        const pagos = Array.from(document.querySelectorAll('.pago-checkbox:checked'))
            .map(cb => cb.value);

        // Forma de envío seleccionada
        const envio = document.querySelector('.envio-radio:checked');
        const direccion = document.getElementById('direccion-envio') ? document.getElementById('direccion-envio').value.trim() : '';

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

        // Armar mensaje
        mensajeFinal = `Quisiera pedir esto:\n${seleccionados.join('\n')}`;
        mensajeFinal += `\n\nForma de pago: ${pagos.join(', ')}`;
        mensajeFinal += `\n\nEntrega: ${envio.value}`;
        if (envio.value === 'Para enviar') {
            mensajeFinal += `\nDirección: ${direccion}`;
        }

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
    });

    // Cerrar modal al hacer click fuera del cuadro
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});