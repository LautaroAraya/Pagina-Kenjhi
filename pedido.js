document.addEventListener('DOMContentLoaded', function () {
    // Agrega checkbox y, si corresponde, input de cantidad a cada item de menú y agregados
    document.querySelectorAll('.menu-section ul li').forEach(function (li) {
        const texto = li.textContent.trim().toUpperCase();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pedido-checkbox';
        checkbox.value = li.textContent.trim();
        checkbox.style.marginRight = '8px';

        // Detectar aderezos de pollo kentucky
        const esAderezoDePollo = (
            texto.includes('MAYONESA COMUN') ||
            texto.includes('MAYONESA DE AJO') ||
            texto.includes('KETCHUP COMUN') ||
            texto.includes('KETCHUP PICANTE')
        );
        // No agregar contador a CHEDDAR, BACON, 2 PIZZETAS y aderezos de pollo kentucky
        if (
            !texto.includes('CHEDDAR.') &&
            !texto.includes('BACON.') &&
            !texto.includes('2 PIZZETAS.') &&
            !esAderezoDePollo
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

    // Función para actualizar el total
    function actualizarTotal() {
        let total = 0;
        document.querySelectorAll('.pedido-checkbox:checked').forEach(cb => {
            const li = cb.parentElement;
            const precio = parseFloat(li.getAttribute('data-precio')) || 0;
            const cantidadInput = li.querySelector('.cantidad-input');
            let cantidad = 1;
            if (cantidadInput) cantidad = parseInt(cantidadInput.value) || 0;
            total += precio * cantidad;
        });
        const totalDiv = document.getElementById('total-pedido');
        if (totalDiv) totalDiv.innerText = 'Total: $' + total.toLocaleString();
        return total;
    }

    // Actualizar total al cambiar cantidades o selección
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('cantidad-input') || e.target.classList.contains('pedido-checkbox')) {
            actualizarTotal();
        }
    });
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('pedido-checkbox')) {
            actualizarTotal();
        }
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

        // Artículos seleccionados con cantidad y precio
        const seleccionados = Array.from(document.querySelectorAll('.pedido-checkbox:checked'))
            .map(cb => {
                const li = cb.parentElement;
                const precio = parseFloat(li.getAttribute('data-precio')) || 0;
                const cantidadInput = li.querySelector('.cantidad-input');
                let cantidad = 1;
                if (cantidadInput) cantidad = parseInt(cantidadInput.value) || 0;
                return {
                    texto: cb.value,
                    cantidad: cantidad,
                    precio: precio,
                    subtotal: precio * cantidad,
                    esAderezoPollo: (
                        cb.value.toUpperCase().includes('MAYONESA COMUN') ||
                        cb.value.toUpperCase().includes('MAYONESA DE AJO') ||
                        cb.value.toUpperCase().includes('KETCHUP COMUN') ||
                        cb.value.toUpperCase().includes('KETCHUP PICANTE')
                    )
                };
            });

        // Separar aderezos de pollo kentucky
        const aderezosPollo = seleccionados.filter(item => item.esAderezoPollo);
        const productosSeleccionados = seleccionados.filter(item => !item.esAderezoPollo);

        // Validar que todos los productos seleccionados tengan cantidad mayor a 0
        const algunoSinCantidad = productosSeleccionados.some(item => item.cantidad < 1 || isNaN(item.cantidad));
        if (algunoSinCantidad) {
            alert('Ingresá la cantidad para cada producto seleccionado (debe ser al menos 1).');
            return;
        }

        // ...la validación ya se realiza con productosSeleccionados más arriba...

        // Método de pago seleccionado
        const pagos = Array.from(document.querySelectorAll('.pago-checkbox:checked'))
            .map(cb => cb.value);

        // Forma de envío seleccionada
        const envio = document.querySelector('.envio-radio:checked');
        const direccion = document.getElementById('direccion-envio') ? document.getElementById('direccion-envio').value.trim() : '';
        const nombrePedido = document.getElementById('nombre-pedido') ? document.getElementById('nombre-pedido').value.trim() : '';

        const horarioPedido = document.getElementById('horario-pedido') ? document.getElementById('horario-pedido').value.trim() : '';


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
        if (horarioPedido === '') {
            alert('Ingresá el horario de retiro/envío.');
            document.getElementById('horario-pedido').focus();
            return;
        }

        // Calcular total
        const total = seleccionados.reduce((acc, item) => acc + item.subtotal, 0);

        // Armar mensaje
        const productosTexto = productosSeleccionados.map(item =>
            `- ${item.texto} x${item.cantidad} ($${item.precio.toLocaleString()} c/u) = $${item.subtotal.toLocaleString()}`
        ).join('\n');
        mensajeFinal = `Quisiera pedir esto:\n${productosTexto}`;
        if (aderezosPollo.length > 0) {
            mensajeFinal += `\n\nAderezos para Pollo Kentucky: ` + aderezosPollo.map(a => a.texto).join(', ');
        }
        mensajeFinal += `\n\nForma de pago: ${pagos.join(', ')}`;
        mensajeFinal += `\n\nEntrega: ${envio.value}`;
        if (envio.value === 'Para enviar') {
            mensajeFinal += `\nDirección: ${direccion}`;
        }
        mensajeFinal += `\n\nNombre: ${nombrePedido}`;
        //agregar el horario del pedido
        if (horarioPedido) {
            mensajeFinal += `\n\nHorario: ${horarioPedido}`;
        }
        mensajeFinal += `\n\nTOTAL: $${total.toLocaleString()}`;

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